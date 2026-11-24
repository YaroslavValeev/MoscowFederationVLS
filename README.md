# ФВЛС Москвы

Готовый к переносу срез сайта. Версия Sites 26 собрана из коммита `f7da35102b6822189b28925807ffd2d5d3a2fc98`. В `dist/` находятся страницы, стили, скрипт и скачиваемые материалы. В разделе FVLSchool ссылка ведёт на пример кабинета на сайте до выхода публичной версии приложения.

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

В браузере проверьте переходы к дисциплинам, три колонки «Пути спортсмена», запись в клуб и скачивание документов ЕВСК и DOCX.

## Переключение домена

По состоянию на 23 ноября 2026 года `fvls.mywavewake.ru` разрешается в `62.113.42.227`. По HTTPS на нём открывается «Премия ФВЛС». Проверьте текущий маршрут и определите адрес премии до переключения корневого маршрута.

После проверки контейнера подключите его к действующему прокси сайта и направьте виртуальный хост `fvls.mywavewake.ru` на его локальный порт. При размещении на том же сервере используйте существующую запись DNS и проверьте HTTPS. Текущая публикация в Sites доступна владельцу. При переносе настройте на прокси согласованный доступ.

Для отката верните прокси на предыдущий сервер приложения премии. После переключения проверьте главную, маршрут школы и загрузки на [fvls.mywavewake.ru](https://fvls.mywavewake.ru/).
