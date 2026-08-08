# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F1-I27 закрыта. Следующая карточка — **F1-I28** (Supabase Auth) — только по отдельному запросу.

## Принятые решения

- CP-1A, CP-2, CP-3, CP-4 приняты.
- Remote Supabase: `korean-learning` / ref `cyoezrdxqncroflgkyry` / region `ap-northeast-2`.
- Dashboard: https://supabase.com/dashboard/project/cyoezrdxqncroflgkyry
- API URL: https://cyoezrdxqncroflgkyry.supabase.co
- Auth redirects: localhost + Vercel preview (`korean-learning-gray.vercel.app/auth/callback`).
- `.env.local` содержит remote keys — не коммитить.
- Remote migrations на production **не применялись** (только local + CI).

## Открытые задачи

- [ ] Отозвать/перевыпустить Supabase access token (был в чате).
- [ ] F1-I28 Supabase Auth — по отдельному запросу.

## Контекст

Ветка: `feature/database-rls` (`feat: secure database with row level security`).
Gate: format/lint/typecheck/230 unit/17 integration/5 db/9 rls/build на Node 24.18.0.
RLS: published/approved content для anon; owner isolation; `exercise_options_public` без `is_correct`.
