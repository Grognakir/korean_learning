# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F2-I06 выполнен. Следующая карточка — F2-I07 (content audit gate / CP-6).

## F2-I06 — результат

- Parser `parse-curriculum-texts.ts` / `parse-reading-html.ts`
- Generator `pnpm content:generate-reading` (HTML via `tmp/korean_reading_test.html` или `READING_HTML_PATH`)
- `reading-passages.json`: 93 textbook/appendix + 85 exam passages
- `exercises-reading.json`: 5×20 = 100 draft single-choice
- `reading-reconciliation.json`: merge decisions + regression flags
- HTML UI не копировался в приложение; answers только в authoring JSON

## Gate

- content:validate / test:content
- format/lint/typecheck/unit/integration/build

## Коммит / ветка

- Branch: `codex/f2-i06-reading-corpus`
- Commit: `feat: reconcile reading source corpus`

## Следующий шаг

F2-I07 — audit gate и остановка на CP-6.
