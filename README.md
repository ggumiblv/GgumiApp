# GgumiApp

Приложение для тренировок: PWA на Vite, React и TypeScript, работает офлайн.

## Команды

- `npm run dev` — разработка
- `npm run build` — сборка в `dist/`
- `npm run preview` — запуск собранной версии
- `npm run lint` — линтер

Service worker работает только в собранной версии, поэтому офлайн проверяется через `build` и `preview`, а не через `dev`.

Иконки генерируются из `public/icon.svg`:

```sh
npx @vite-pwa/assets-generator --preset minimal-2023 public/icon.svg
```

## Установка на iPhone

Откройте опубликованное приложение в Safari и выберите «Поделиться» → «На экран Домой».

## Деплой

Каждый пуш в `main` публикует приложение на GitHub Pages через `.github/workflows/deploy.yml`. Адрес: `https://<имя>.github.io/GgumiApp/`.

Если репозиторий будет переименован, нужно поменять `base` в `vite.config.ts`.
