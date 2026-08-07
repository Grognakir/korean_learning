# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-07

## Чем занимаемся

Фаза 1 начата. Итерации F1-I01 и F1-I02 завершены: репозиторий подготовлен, а минимальное Next.js App Router приложение без Tailwind запускается и собирается.

## Принятые решения

- Проект использует Node.js 24.18.0 LTS и pnpm 10.34.5; команды проверки запускались на точном Node.js 24.18.0 через временный runtime.
- Установлены Next.js 16.3.0, React/React DOM 19.2.8, TypeScript 7.0.2 и актуальные типы.
- Приложение размещено в `src/app`, корневой layout имеет `lang="ru"`, главная страница пока минимальна и не содержит преждевременных стилей.
- Tailwind и другие запрещённые UI/CSS инструменты не установлены.
- Next.js 16.3 автоматически создаёт `AGENTS.md` и `CLAUDE.md`; они сохраняются как framework agent configuration. Перед кодом прочитаны локальные руководства installation, project structure, layouts/pages, TypeScript и Next CLI.
- По локальной документации Next.js 16.3 файл `next-env.d.ts` генерируется framework и должен находиться в `.gitignore`, поэтому он не коммитится.
- `PLAN_REVISION_2026-08-07.md` остаётся пользовательским неотслеживаемым файлом вне коммитов.

## Открытые задачи

- [ ] Выполнить F1-I03 в отдельной ветке: усилить strict TypeScript, настроить ESLint и Prettier.
- [ ] Создать базовый `.github/workflows/ci.yml` с закреплёнными Node.js/pnpm и проверками format/lint/typecheck/build.
- [ ] Добавить scripts для статических проверок и убедиться, что локальные команды совпадают с CI.
- [ ] В F1-I04 подключить Vitest и React Testing Library отдельным коммитом.

## Контекст для следующей сессии

Текущая ветка — `chore/initialize-next-app`, её родитель содержит коммит F1-I01 `775e53b`. F1-I02 включает `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `AGENTS.md` и `CLAUDE.md`; `next-env.d.ts` игнорируется. Проверены `next typegen`, `tsc --noEmit`, production build и dev server `/` с HTTP 200 на Node.js 24.18.0. Для дальнейшей работы обязательно читать релевантные файлы в `node_modules/next/dist/docs/` перед использованием Next.js API.
