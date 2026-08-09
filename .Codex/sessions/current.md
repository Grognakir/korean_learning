# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

CP-6 принят. F2-I08 выполнен. Следующая карточка — F2-I09.

## F2-I08 — результат

- `scripts/content/curriculumSeedSql.ts` — SQL builder (insert/upsert)
- `pnpm db:seed` — sample + curriculum → `supabase/seed.sql`
- `pnpm content:import` / `content:import:dry-run` — transactional upsert
- Local counts: 17 modules, 82 topics, 1091 dictionary, 178 passages, 114 exercises
- Status never elevated by import; reading bank stays draft
- Sample module not archived
- Remote Supabase seed not applied

## Gate

- content/unit/integration/db/rls/build

## Коммит / ветка

- Branch: `codex/f2-i08-content-seed-pipeline`
- Commit: `feat: add deterministic curriculum content import`

## Следующий шаг

F2-I09 — repositories, public DTO и cache queries.
