import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock
from urllib.parse import urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import nginx_switch as switch


CONFIG = '''
# A separate site must remain untouched.
server {
    listen 443 ssl;
    server_name mywavewake.ru www.mywavewake.ru;
    location / { proxy_pass http://127.0.0.1:5000; }
}
server {
    listen 80;
    server_name fvls.mywavewake.ru;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl; # managed by certbot
    listen [::]:443 ssl;
    server_name fvls.mywavewake.ru;
    ssl_certificate /etc/letsencrypt/live/example/fullchain.pem;
    location ^~ /.well-known/acme-challenge/ { root /var/www/acme; }
    location / {
        # The existing award site is preserved in the backup.
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header X-Test "a brace { inside a quote }";
    }
}
'''


class NginxSwitchTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / 'sites.conf'
        self.path.write_text(CONFIG, encoding='utf-8')

    def select(self, text=CONFIG, check_includes=False):
        return switch.select_and_patch({self.path: text}, check_includes=check_includes)

    def test_switch_keeps_other_site_http_redirect_and_acme(self):
        _, updated = self.select()
        self.assertIn('server_name mywavewake.ru www.mywavewake.ru;', updated)
        self.assertIn('proxy_pass http://127.0.0.1:5000;', updated)
        self.assertIn('return 301 https://$host$request_uri;', updated)
        self.assertIn('location ^~ /.well-known/acme-challenge/', updated)
        self.assertIn('proxy_pass http://127.0.0.1:18765;', updated)
        self.assertNotIn('proxy_pass http://127.0.0.1:8080;', updated)
        self.assertEqual(self.select(updated)[1], updated)

    def test_refuses_shared_virtual_host(self):
        text = CONFIG.replace('server_name fvls.mywavewake.ru;\n    ssl_certificate', 'server_name fvls.mywavewake.ru other.example;\n    ssl_certificate')
        with self.assertRaises(switch.ConfigError):
            self.select(text)

    def test_refuses_other_or_ambiguous_locations(self):
        for addition in ['location /assets/ { root /srv/other; }', 'location ~ \\.css$ { root /srv/other; }', 'location / { root /srv/other; }']:
            text = CONFIG.replace('    location / {\n        # The existing', f'    {addition}\n    location / {{\n        # The existing')
            with self.subTest(addition=addition), self.assertRaises(switch.ConfigError):
                self.select(text)

    def test_refuses_server_rewrites_and_wrong_port(self):
        text = CONFIG.replace('    ssl_certificate', '    return 301 https://example.test;\n    ssl_certificate')
        with self.assertRaises(switch.ConfigError):
            self.select(text)
        text = CONFIG.replace('listen 443 ssl; # managed by certbot', 'listen 1443 ssl; # managed by certbot').replace('listen [::]:443 ssl;', 'listen [::]:1443 ssl;')
        with self.assertRaises(switch.ConfigError):
            self.select(text)

    def test_checks_server_level_includes(self):
        include = Path(self.temp.name) / 'include.conf'
        text = CONFIG.replace('    ssl_certificate', f'    include {include};\n    ssl_certificate')
        include.write_text('ssl_protocols TLSv1.2 TLSv1.3;\n', encoding='utf-8')
        self.select(text, check_includes=True)
        include.write_text('location /assets/ { root /srv/other; }\n', encoding='utf-8')
        with self.assertRaises(switch.ConfigError):
            self.select(text, check_includes=True)

    def test_failed_https_check_restores_config_and_reloads(self):
        backup_dir = Path(self.temp.name) / 'backups'
        commands = []

        def fake_run(command, **kwargs):
            commands.append(command)
            return mock.Mock(returncode=0)

        with mock.patch.object(switch, 'BACKUP_DIR', backup_dir), \
             mock.patch.object(switch, 'active_config_files', return_value={self.path: CONFIG}), \
             mock.patch.object(switch, 'verify_local_https', side_effect=switch.ConfigError('test failure')), \
             mock.patch.object(switch.subprocess, 'run', side_effect=fake_run), \
             mock.patch.object(sys, 'argv', ['nginx_switch.py', '--apply']):
            with self.assertRaises(switch.ConfigError):
                switch.main()
        self.assertEqual(self.path.read_text(encoding='utf-8'), CONFIG)
        self.assertEqual(commands.count(['systemctl', 'reload', 'nginx']), 2)
        self.assertEqual(len(list(backup_dir.glob('*.conf'))), 1)

    def test_rollback_requires_unchanged_config_then_restores(self):
        backup_dir = Path(self.temp.name) / 'backups'
        backup_dir.mkdir()
        backup = backup_dir / 'original.conf'
        backup.write_text(CONFIG, encoding='utf-8')
        _, updated = self.select()
        self.path.write_text(updated, encoding='utf-8')
        switch.write_state(backup_dir, self.path, backup, CONFIG, updated)
        with mock.patch.object(switch, 'BACKUP_DIR', backup_dir), \
             mock.patch.object(switch, 'NGINX_ROOT', Path(self.temp.name)), \
             mock.patch.object(switch.subprocess, 'run', return_value=mock.Mock(returncode=0)) as run:
            self.path.write_text(updated + '\n# changed later\n', encoding='utf-8')
            with self.assertRaises(switch.ConfigError):
                switch.rollback()
            self.path.write_text(updated, encoding='utf-8')
            switch.rollback()
        self.assertEqual(self.path.read_text(encoding='utf-8'), CONFIG)
        self.assertFalse((backup_dir / 'latest.json').exists())
        self.assertEqual(run.call_count, 2)

    def test_https_check_retries_old_worker_and_accepts_exact_release(self):
        root = Path(self.temp.name)
        (root / 'dist/assets').mkdir(parents=True)
        contents = {'/': b'<title>New site</title>', '/school': b'school', '/team.html': b'team', '/assets/mark.png': b'png'}
        for url, filename in [('/', 'index.html'), ('/school', 'school.html'), ('/team.html', 'team.html'), ('/assets/mark.png', 'assets/mark.png')]:
            (root / 'dist' / filename).write_bytes(contents[url])
        calls = []

        def fake_curl(command, **kwargs):
            url = urlsplit(command[-1]).path
            calls.append(url)
            body = b'<title>Old site</title>' if len(calls) == 1 else contents[url]
            Path(command[command.index('--output') + 1]).write_bytes(body)
            return mock.Mock(returncode=0, stdout=b'200', stderr=b'')

        with mock.patch.object(switch, 'ROOT', root), \
             mock.patch.object(switch.subprocess, 'run', side_effect=fake_curl), \
             mock.patch.object(switch.time, 'sleep'):
            switch.verify_local_https(addresses=['127.0.0.1'], retry_seconds=1)
        self.assertEqual(calls.count('/'), 2)
        self.assertIn('/assets/mark.png', calls)

    def test_https_check_reports_curl_error_and_uses_ipv6(self):
        root = Path(self.temp.name)
        (root / 'dist/assets').mkdir(parents=True)
        for filename in ['index.html', 'school.html', 'team.html', 'assets/mark.png']:
            (root / 'dist' / filename).write_bytes(b'expected')

        def fake_curl(command, **kwargs):
            self.assertIn(f'{switch.DOMAIN}:443:[::1]', command)
            return mock.Mock(returncode=60, stdout=b'000', stderr=b'curl: (60) SSL certificate problem')

        with mock.patch.object(switch, 'ROOT', root), \
             mock.patch.object(switch.subprocess, 'run', side_effect=fake_curl):
            with self.assertRaisesRegex(switch.ConfigError, 'SSL certificate problem'):
                switch.verify_local_https(addresses=['::1'], retry_seconds=0)

    def test_https_check_reports_unexpected_page_title(self):
        root = Path(self.temp.name)
        (root / 'dist/assets').mkdir(parents=True)
        for filename in ['index.html', 'school.html', 'team.html', 'assets/mark.png']:
            (root / 'dist' / filename).write_bytes(b'expected')

        def fake_curl(command, **kwargs):
            Path(command[command.index('--output') + 1]).write_bytes('<title>Премия ФВЛС</title>'.encode())
            return mock.Mock(returncode=0, stdout=b'200', stderr=b'')

        with mock.patch.object(switch, 'ROOT', root), \
             mock.patch.object(switch.subprocess, 'run', side_effect=fake_curl):
            with self.assertRaisesRegex(switch.ConfigError, 'Премия ФВЛС'):
                switch.verify_local_https(addresses=['127.0.0.1'], retry_seconds=0)


if __name__ == '__main__':
    unittest.main()
