# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-07

## Чем занимаемся

Фаза 1 продолжается. Итерации F1-I01–F1-I03 завершены: репозиторий подготовлен, минимальное Next.js-приложение работает, а статические проверки и базовый CI настроены.

## Принятые решения

- Проект использует Node.js 24.18.0 LTS и pnpm 10.34.5; проверки выполняются на точном Node.js 24.18.0.
- TypeScript закреплён на 6.0.3, ESLint — на совместимой ветке 9.39.2; latest TypeScript 7 и ESLint 10 пока не проходят peer-диапазоны Next.js ESLint-плагинов.
- Включены дополнительные строгие TypeScript options: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch` и контроль регистра путей.
- ESLint использует flat config Next.js `core-web-vitals` и TypeScript, а Prettier отвечает только за форматирование.
- CI запускается для pull request в `main`, push в `main` и вручную; устанавливает закреплённые pnpm/Node.js и выполняет frozen install, format, lint, typecheck и build.
- `PLAN_REVISION_2026-08-07.md` остаётся пользовательским неотслеживаемым файлом вне коммитов.

## Открытые задачи

- [ ] Выполнить F1-I04 в отдельной ветке: подключить Vitest, React Testing Library и smoke-тесты.
- [ ] Добавить unit/component test step в существующий CI workflow.
- [ ] Продолжать малые итерации до пользовательской контрольной точки CP-1 после F1-I11.

## Контекст для следующей сессии

Текущая ветка — `chore/code-quality`; F1-I01 и F1-I02 находятся в её истории. F1-I03 добавляет ESLint/Prettier, строгие TypeScript options и `.github/workflows/ci.yml`. Frozen install, format check, lint, typecheck и production build проходят; фактический GitHub Actions run возможен после push. Перед дальнейшим кодом необходимо читать релевантные руководства в `node_modules/next/dist/docs/` согласно корневому `AGENTS.md`.
