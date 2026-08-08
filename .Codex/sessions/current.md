# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F1-I25 закрыта: Supabase client foundation + local Docker stack. Следующая карточка — **F1-I26** (schema/migrations). Не начинать в этом шаге.

## Принятые решения

- CP-1A, CP-2, CP-3, CP-4 приняты.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, server-only `SUPABASE_SECRET_KEY`.
- Client barrel (`src/lib/supabase/index.ts`) — только browser + health; server factories отдельно.
- Local: `supabase/config.toml`, storage disabled, seed disabled до F1-I26.
- Admin/service-role factory не создан (deferred).

## Открытые задачи

- [ ] Опционально: `supabase login` + link remote cloud project.
- [ ] Следующая итерация: F1-I26 по отдельному запросу.

## Контекст

Ветка: `feature/supabase-foundation`.
Gate: 230 unit + 17 integration + build зелёные на Node 24.18.0.
Local auth health: HTTP 200 на `127.0.0.1:54321`.
