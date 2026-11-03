# GgumiApp

Приложение для тренировок: PWA на Vite, React и TypeScript, работает офлайн.

## Команды

- `npm run dev` — разработка
- `npm run build` — сборка в `dist/`
- `npm run preview` — запуск собранной версии
- `npm run lint` — линтер

Service worker работает только в собранной версии, поэтому офлайн проверяется через `build` и `preview`, а не через `dev`.

Иконки приложения генерируются из `src/assets/icons/app/icon.svg`:

```sh
npx @vite-pwa/assets-generator --preset minimal-2023 src/assets/icons/app/icon.svg
```

## Установка на iPhone

Откройте опубликованное приложение в Safari и выберите «Поделиться» → «На экран Домой».

## Деплой

Каждый пуш в `main` публикует приложение на GitHub Pages через `.github/workflows/deploy.yml`. Адрес: `https://<имя>.github.io/GgumiApp/`.

Если репозиторий будет переименован, нужно поменять `base` в `vite.config.ts`.

## Аккаунты и облако

Приложение работает с локальными данными, а Firebase хранит их копию. Аккаунты появятся в интерфейсе, когда в `src/cloud/firebaseConfig.ts` будет заполнен `productionConfig`. Правила доступа лежат в `firestore.rules`, их нужно вставить в консоли Firebase.

Для проверки на эмуляторе нужна Java:

```sh
npx firebase-tools emulators:start --only auth,firestore --project demo-ggumiapp
VITE_USE_EMULATOR=1 npm run dev
```
