#!/usr/bin/env bash
set -euo pipefail

FVLS_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
FVLS_PORT=18765
export FVLS_PORT
FVLS_BIND_ADDRESS=127.0.0.1
export FVLS_BIND_ADDRESS

if [[ ${EUID} -ne 0 ]]; then
  printf 'Запустите команду через sudo.\n' >&2
  exit 1
fi
for fvls_tool in nginx systemctl python3 curl; do
  if ! command -v "$fvls_tool" >/dev/null; then
    printf 'Не найдена необходимая программа: %s\n' "$fvls_tool" >&2
    exit 1
  fi
done
systemctl is-active --quiet nginx || { printf 'Nginx не запущен.\n' >&2; exit 1; }
python3 "$FVLS_ROOT/deploy/nginx_switch.py"

if ! command -v docker >/dev/null; then
  if ! command -v apt-get >/dev/null; then
    printf 'Docker не найден; установите Docker и повторите команду.\n' >&2
    exit 1
  fi
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io
  systemctl enable --now docker
fi
docker info >/dev/null || { printf 'Docker установлен, но демон недоступен.\n' >&2; exit 1; }
if docker compose version >/dev/null 2>&1; then
  FVLS_COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null; then
  FVLS_COMPOSE=(docker-compose)
elif command -v apt-get >/dev/null; then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y docker-compose
  FVLS_COMPOSE=(docker-compose)
else
  printf 'Docker Compose не найден.\n' >&2
  exit 1
fi

FVLS_COMPOSE+=(--project-directory "$FVLS_ROOT" -p fvls-moskva -f "$FVLS_ROOT/docker-compose.yml")
if ! python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 18765)); s.close()' 2>/dev/null; then
  if ! docker ps -q --filter 'label=com.docker.compose.project=fvls-moskva' --filter 'publish=18765' | grep -q .; then
    printf 'Порт 127.0.0.1:18765 занят другой службой. Конфигурация nginx не изменена.\n' >&2
    exit 1
  fi
fi

"${FVLS_COMPOSE[@]}" up -d --build
FVLS_TMP="$(mktemp)"
trap 'rm -f "$FVLS_TMP"' EXIT
FVLS_READY=0
for fvls_attempt in {1..30}; do
  if curl --noproxy '*' -fs --max-time 2 "http://127.0.0.1:$FVLS_PORT/" -o "$FVLS_TMP" && cmp -s "$FVLS_TMP" "$FVLS_ROOT/dist/index.html"; then
    FVLS_READY=1
    break
  fi
  sleep 1
done
if [[ $FVLS_READY -ne 1 ]]; then
  printf 'Контейнер не прошёл проверку. Конфигурация nginx не изменена.\n' >&2
  exit 1
fi
for fvls_pair in 'school:school.html' 'team.html:team.html' 'evsk-explorer.js:evsk-explorer.js' 'assets/mark.png:assets/mark.png'; do
  fvls_url="${fvls_pair%%:*}"
  fvls_file="${fvls_pair#*:}"
  curl --noproxy '*' -fsS --max-time 5 "http://127.0.0.1:$FVLS_PORT/$fvls_url" -o "$FVLS_TMP"
  cmp -s "$FVLS_TMP" "$FVLS_ROOT/dist/$fvls_file" || { printf 'Не прошла проверка %s.\n' "$fvls_url" >&2; exit 1; }
done

python3 "$FVLS_ROOT/deploy/nginx_switch.py" --apply
printf 'Сайт развёрнут: https://fvls.mywavewake.ru/\n'
