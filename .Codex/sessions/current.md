# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F1-I25 закрыта + remote Supabase project создан и связан. Следующая карточка — **F1-I26** (schema/migrations).

## Принятые решения

- CP-1A, CP-2, CP-3, CP-4 приняты.
- Remote Supabase: `korean-learning` / ref `cyoezrdxqncroflgkyry` / region `ap-northeast-2`.
- Dashboard: https://supabase.com/dashboard/project/cyoezrdxqncroflgkyry
- API URL: https://cyoezrdxqncroflgkyry.supabase.co
- Auth redirects: localhost + Vercel preview (`korean-learning-gray.vercel.app/auth/callback`).
- `.env.local` содержит remote keys — не коммитить.

## Открытые задачи

- [ ] Отозвать/перевыпустить Supabase access token (был в чате).
- [ ] Следующая итерация: F1-I26 по отдельному запросу.

## Контекст

Ветка: `feature/supabase-foundation` (`17eddf0`).
Remote auth health: HTTP 200.
