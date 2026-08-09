# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F2-I04 выполнен. Следующая карточка — F2-I05 (dictionary draft).

## F2-I04 — результат

- Generator `scripts/content/generate-curriculum-catalog.ts` + `pnpm content:generate-catalog`
- `content/phase-2/units.json`: 16 draft units (`u01`…`u16`)
- `content/phase-2/grammar-topics.json`: 80 draft syllabus topics, counts `5,4,5,5,5,6,5,5,5,5,5,5,5,5,5,5`
- `content/phase-2/provenance.json`: 96 rows (units + grammar)
- Coverage tests in `scripts/content/curriculum-catalog.test.ts`
- Ничего не published; honorifics module не создавался

## Gate

- `pnpm content:validate` green
- `pnpm test:content` includes catalog coverage
- format/lint/typecheck/unit/integration/build по карточке

## Коммит / ветка

- Branch: `codex/f2-i04-curriculum-catalog`
- Commit: `feat: add level one curriculum catalog`

## Следующий шаг

F2-I05 — reconcile canonical Korean dictionary. Push/merge без ожидания CI по указанию пользователя.
