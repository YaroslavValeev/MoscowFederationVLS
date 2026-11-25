#!/usr/bin/env python3
"""Safely switch one existing HTTPS nginx virtual host to the FVLS container."""

import argparse
from dataclasses import dataclass
from datetime import datetime
import glob
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile


DOMAIN = 'fvls.mywavewake.ru'
PORT = 18765
ROOT = Path(__file__).resolve().parent.parent
BACKUP_DIR = Path('/var/backups/fvls-moskva')
NGINX_ROOT = Path('/etc/nginx')


class ConfigError(Exception):
    pass


@dataclass
class Token:
    value: str
    start: int
    end: int


@dataclass
class Directive:
    name: str
    args: list
    start: int
    end: int
    children: list | None


def tokenize(text):
    result = []
    i = 0
    while i < len(text):
        if text[i].isspace():
            i += 1
            continue
        if text[i] == '#':
            end = text.find('\n', i)
            i = len(text) if end < 0 else end
            continue
        if text[i] in '{};':
            result.append(Token(text[i], i, i + 1))
            i += 1
            continue
        start = i
        value = []
        while i < len(text) and not text[i].isspace() and text[i] not in '{};#':
            if text[i] in "'\"":
                quote = text[i]
                i += 1
                while i < len(text) and text[i] != quote:
                    if text[i] == '\\' and i + 1 < len(text):
                        i += 1
                    value.append(text[i])
                    i += 1
                if i >= len(text):
                    raise ConfigError('Незакрытая строка в конфигурации nginx')
                i += 1
            elif text[i] == '\\' and i + 1 < len(text):
                i += 1
                value.append(text[i])
                i += 1
            elif text.startswith('${', i):
                end = text.find('}', i + 2)
                if end < 0:
                    raise ConfigError('Незакрытая переменная в конфигурации nginx')
                value.append(text[i:end + 1])
                i = end + 1
            else:
                value.append(text[i])
                i += 1
        if not value:
            raise ConfigError('Не удалось разобрать конфигурацию nginx')
        result.append(Token(''.join(value), start, i))
    return result


def parse(text):
    tokens = tokenize(text)

    def sequence(index, nested):
        output = []
        while index < len(tokens):
            if tokens[index].value == '}':
                if not nested:
                    raise ConfigError('Лишняя закрывающая скобка в nginx')
                return output, index + 1, tokens[index].end
            start = tokens[index].start
            words = []
            while index < len(tokens) and tokens[index].value not in '{};':
                words.append(tokens[index].value)
                index += 1
            if not words or index >= len(tokens) or tokens[index].value == '}':
                raise ConfigError('Неполная директива nginx')
            delimiter = tokens[index].value
            if delimiter == ';':
                output.append(Directive(words[0], words[1:], start, tokens[index].end, None))
                index += 1
            else:
                children, index, end = sequence(index + 1, True)
                output.append(Directive(words[0], words[1:], start, end, children))
        if nested:
            raise ConfigError('Незакрытый блок в nginx')
        return output, index, len(text)

    return sequence(0, False)[0]


def walk(nodes):
    for node in nodes:
        yield node
        if node.children is not None:
            yield from walk(node.children)


def include_is_safe(pattern, seen=None):
    """A server-level include must not hide locations or redirects."""
    if '$' in pattern:
        raise ConfigError('В HTTPS-сервере есть динамический include; требуется ручная проверка')
    if not pattern.startswith('/'):
        pattern = '/etc/nginx/' + pattern
    seen = set() if seen is None else seen
    for name in glob.glob(pattern):
        path = Path(name).resolve()
        if path in seen:
            continue
        seen.add(path)
        try:
            included = parse(path.read_text(encoding='utf-8'))
        except (OSError, UnicodeError) as error:
            raise ConfigError(f'Не удалось проверить include {path}: {error}') from error
        for node in walk(included):
            if node.name in {'location', 'return', 'rewrite', 'if'}:
                raise ConfigError(f'В include {path} есть маршруты; требуется ручная проверка')
            if node.name == 'include':
                for nested in node.args:
                    include_is_safe(nested, seen)


def select_and_patch(files, domain=DOMAIN, port=PORT, check_includes=True):
    """Return the one target file and patched text, or fail without changing files."""
    matches = []
    for path, text in files.items():
        if domain not in text:
            continue
        for server in (node for node in walk(parse(text)) if node.name == 'server' and node.children is not None):
            names = [arg for node in server.children if node.name == 'server_name' for arg in node.args]
            listens = [node.args for node in server.children if node.name == 'listen']
            tls = any(any(re.search(r'(^|:)443$', part) for part in args) and 'ssl' in args for args in listens)
            if domain not in names or not tls:
                continue
            if set(names) != {domain}:
                raise ConfigError('HTTPS-сервер домена обслуживает также другие имена; автоматическое переключение остановлено')
            matches.append((Path(path), text, server))
    if len(matches) != 1:
        raise ConfigError(f'Найдено HTTPS-серверов только для {domain}: {len(matches)}; нужен ровно один')

    path, text, server = matches[0]
    locations = [node for node in server.children if node.name == 'location']
    root = [node for node in locations if node.args == ['/'] and node.children is not None]
    if len(root) != 1:
        raise ConfigError('Не найден единственный прямой location / в HTTPS-сервере домена')
    for node in locations:
        if node is root[0]:
            continue
        args = node.args[1:] if node.args and node.args[0] in {'=', '^~'} else node.args
        if len(args) != 1 or not args[0].startswith('/.well-known/acme-challenge/'):
            raise ConfigError('В HTTPS-сервере есть другие location; требуется ручная проверка маршрутов')
    for node in server.children:
        if node.name in {'if', 'return', 'rewrite', 'try_files'}:
            raise ConfigError(f'В HTTPS-сервере есть директива {node.name}; требуется ручная проверка')
        if check_includes and node.name == 'include':
            for include in node.args:
                include_is_safe(include)

    location = root[0]
    start_line = text.rfind('\n', 0, location.start) + 1
    indent = text[start_line:location.start]
    if indent.strip():
        raise ConfigError('location / должен начинаться с новой строки; требуется ручная проверка')
    inner = indent + '    '
    replacement = ('location / {\n'
        f'{inner}proxy_pass http://127.0.0.1:{port};\n'
        f'{inner}proxy_http_version 1.1;\n'
        f'{inner}proxy_set_header Host $host;\n'
        f'{inner}proxy_set_header X-Real-IP $remote_addr;\n'
        f'{inner}proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n'
        f'{inner}proxy_set_header X-Forwarded-Proto $scheme;\n'
        f'{indent}' + '}')
    return path, text[:location.start] + replacement + text[location.end:]


def active_config_files():
    run = subprocess.run(['nginx', '-T'], capture_output=True, text=True, check=False)
    if run.returncode:
        raise ConfigError('nginx -T завершился с ошибкой; проверьте существующую конфигурацию')
    names = re.findall(r'^# configuration file (.+):$', run.stdout, re.MULTILINE)
    files = {}
    for name in names:
        path = Path(name).resolve()
        if not path.is_relative_to(NGINX_ROOT):
            continue
        try:
            files[path] = path.read_text(encoding='utf-8')
        except (OSError, UnicodeError) as error:
            raise ConfigError(f'Не удалось прочитать {path}: {error}') from error
    if not files:
        raise ConfigError('Не удалось определить активные файлы nginx')
    return files


def atomic_write(path, contents):
    stat = path.stat()
    descriptor, temporary = tempfile.mkstemp(prefix='.fvls-moskva-', dir=path.parent)
    try:
        with os.fdopen(descriptor, 'w', encoding='utf-8', newline='') as stream:
            stream.write(contents)
        os.chmod(temporary, stat.st_mode & 0o7777)
        os.chown(temporary, stat.st_uid, stat.st_gid)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def digest(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def write_state(backup_dir, path, backup, previous, updated):
    state = {'path': str(path), 'backup': str(backup), 'before': digest(previous), 'after': digest(updated)}
    descriptor, temporary = tempfile.mkstemp(prefix='.fvls-state-', dir=backup_dir)
    try:
        with os.fdopen(descriptor, 'w', encoding='utf-8') as stream:
            json.dump(state, stream, ensure_ascii=False)
        os.chmod(temporary, 0o600)
        os.replace(temporary, backup_dir / 'latest.json')
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def rollback():
    state_path = BACKUP_DIR / 'latest.json'
    try:
        state = json.loads(state_path.read_text(encoding='utf-8'))
        path = Path(state['path']).resolve(strict=True)
        backup = Path(state['backup']).resolve(strict=True)
        previous = backup.read_text(encoding='utf-8')
        current = path.read_text(encoding='utf-8')
        before, after = state['before'], state['after']
    except (OSError, ValueError, KeyError, TypeError) as error:
        raise ConfigError(f'Не удалось прочитать данные отката: {error}') from error
    if not path.is_relative_to(NGINX_ROOT.resolve()) or not backup.is_relative_to(BACKUP_DIR.resolve()):
        raise ConfigError('Пути в данных отката не прошли проверку')
    if digest(previous) != before or digest(current) != after:
        raise ConfigError('Конфигурация или резервная копия изменились; автоматический откат остановлен')
    reload_attempted = False
    try:
        atomic_write(path, previous)
        subprocess.run(['nginx', '-t'], check=True)
        reload_attempted = True
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    except BaseException:
        atomic_write(path, current)
        if reload_attempted:
            subprocess.run(['nginx', '-t'], check=False)
            subprocess.run(['systemctl', 'reload', 'nginx'], check=False)
        raise
    state_path.rename(BACKUP_DIR / f'rolled-back-{datetime.now().strftime("%Y%m%d-%H%M%S")}-{os.getpid()}.json')
    print('Предыдущий маршрут nginx восстановлен.')


def verify_local_https():
    for url_path, filename in [('/', 'index.html'), ('/school', 'school.html'), ('/team.html', 'team.html'), ('/assets/mark.png', 'assets/mark.png')]:
        command = ['curl', '--noproxy', '*', '--resolve', f'{DOMAIN}:443:127.0.0.1', '-fsS', '--max-time', '10', f'https://{DOMAIN}{url_path}']
        result = subprocess.run(command, capture_output=True, check=False)
        if result.returncode or result.stdout != (ROOT / 'dist' / filename).read_bytes():
            raise ConfigError(f'Локальная HTTPS-проверка {url_path} не прошла')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group()
    action.add_argument('--apply', action='store_true')
    action.add_argument('--rollback', action='store_true')
    args = parser.parse_args()
    if args.rollback:
        rollback()
        return
    files = active_config_files()
    path, updated = select_and_patch(files)
    if not args.apply:
        print(f'Проверен отдельный HTTPS-сервер: {path}')
        return
    previous = path.read_text(encoding='utf-8')
    if previous != files[path]:
        raise ConfigError('Конфигурация nginx изменилась во время проверки; повторите запуск')
    if previous == updated:
        verify_local_https()
        print('Маршрут уже настроен и проверен.')
        return
    backup_dir = BACKUP_DIR
    backup_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(backup_dir, 0o700)
    backup = backup_dir / f'nginx-{datetime.now().strftime("%Y%m%d-%H%M%S")}-{os.getpid()}.conf'
    shutil.copy2(path, backup)
    reload_attempted = False
    try:
        atomic_write(path, updated)
        subprocess.run(['nginx', '-t'], check=True)
        reload_attempted = True
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
        verify_local_https()
        write_state(backup_dir, path, backup, previous, updated)
    except BaseException:
        atomic_write(path, previous)
        if reload_attempted:
            subprocess.run(['nginx', '-t'], check=False)
            subprocess.run(['systemctl', 'reload', 'nginx'], check=False)
        print(f'Изменение отменено. Резервная копия: {backup}')
        raise
    print(f'HTTPS-маршрут обновлён. Резервная копия: {backup}')


if __name__ == '__main__':
    try:
        main()
    except (ConfigError, OSError, subprocess.SubprocessError) as error:
        raise SystemExit(f'Развёртывание остановлено: {error}') from error
