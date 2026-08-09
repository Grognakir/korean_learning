# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F2-I05 выполнен. Следующая карточка — F2-I06 (reading corpus).

## F2-I05 — результат

- `scripts/content/normalize-dictionary.ts` + `generate-dictionary.ts`
- `pnpm content:generate-dictionary`
- `dictionary-entries.json`: 1091 draft senses
- 50 irregular rows → relations (не новые senses)
- `dictionary-unit-links.json`: пусто (в Markdown нет unit map)
- `dictionary-reconciliation.json`: полная классификация строк + derived 803/731/179 coverage-only
- Категория `добавлено` отсутствует; бизнес-лексика `level=business-draft`, status draft

## Gate

- content:validate / test:content green
- format/lint/typecheck/unit/integration/build по карточке

## Коммит / ветка

- Branch: `codex/f2-i05-dictionary-canonicalization`
- Commit: `feat: reconcile canonical Korean dictionary`

## Следующий шаг

F2-I06 — reconcile reading source corpus. Push/merge без ожидания CI по указанию пользователя.
