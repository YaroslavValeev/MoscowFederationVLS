# ФВЛС Москвы

Готовый к переносу срез сайта. Версия Sites 34 собрана из коммита `48e7fe3cad6a05115dfe5a36ff2a95ada9356586`. В `dist/` находятся страницы, стили, скрипты, скачиваемые материалы и интерактивная иллюстрация пути спортсмена. В разделе FVLSchool ссылка ведёт на пример кабинета на сайте до выхода публичной версии приложения.

## GitHub

Рабочая копия подготовлена на ветке `main`. В `origin` настроен целевой репозиторий, публичный и пустой на момент подготовки. [YaroslavValeev/MoscowFederationVLS](https://github.com/YaroslavValeev/MoscowFederationVLS)

При переносе из архива создайте локальную ветку и добавьте адрес репозитория.

```sh
git init -b main
git add .
git commit -m "Import the Moscow Federation website"
git remote add origin https://github.com/YaroslavValeev/MoscowFederationVLS.git
```

Загрузите ветку в GitHub при начале переноса. Команда публикует содержимое в открытом репозитории.

```sh
git push -u origin main
```

## Предварительный запуск

Контейнер отдаёт `dist/` через Nginx на порту 8080. Маршруты `/`, `/school` и `/school.html` открывают страницы сайта. Конфигурация — в [deploy/nginx.conf](deploy/nginx.conf).

```sh
docker build -t fvls-moskva:release .
docker run -d --rm --name fvls-moskva-preview -p 127.0.0.1::8080 fvls-moskva:release
fvls_preview_address="$(docker port fvls-moskva-preview 8080/tcp)"
curl -fsSI "http://$fvls_preview_address/"
curl -fsSI "http://$fvls_preview_address/school"
```

В браузере проверьте инфографику «Путь спортсмена», переходы к дисциплинам, три колонки пути, запись в клуб и скачивание документов ЕВСК и DOCX.

## Развёртывание на `fvls.mywavewake.ru`

К 24 ноября 2026 года этот адрес обслуживает отдельный сайт «Премия ФВЛС». Переключение нужно выполнять как осознанную замену текущего маршрута после сохранения его конфигурации и проверки контейнера ниже.

1. Скопируйте настройки порта и поднимите контейнер.

   ```sh
   cp .env.example .env
   docker compose up -d --build
   curl -fsSI http://127.0.0.1:8080/
   curl -fsSI http://127.0.0.1:8080/school
   ```

2. Сохраните текущий виртуальный хост премии. В его HTTPS-виртуальном хосте замените маршрут `/` содержимым [deploy/fvls.mywavewake.ru.location.conf.example](deploy/fvls.mywavewake.ru.location.conf.example). Файл сохраняет TLS и заголовки на существующем прокси, а сайт работает во внутреннем контейнере.

3. Проверьте конфигурацию и плавно примените её.

   ```sh
   nginx -t
   systemctl reload nginx
   curl -fsSI https://fvls.mywavewake.ru/
   curl -fsSI https://fvls.mywavewake.ru/school
   ```

4. Откройте главную страницу, `/school`, документы в `assets/documents/` и иллюстрацию в разделе `#athlete-path`. Проверьте увеличение и переходы по интерактивным областям схемы.

`docker-compose.yml` уже ограничивает порт хостом `127.0.0.1`. Для другого свободного локального порта измените только `FVLS_PORT` в `.env` и тот же номер в конфигурации прокси.

Для отката верните сохранённый маршрут премии в виртуальный хост и выполните `nginx -t`, затем `systemctl reload nginx`. Данные и DNS-запись домена при этом не меняются.
