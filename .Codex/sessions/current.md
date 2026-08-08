# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F1-I28 закрыта. Следующая карточка — **F1-I29** (Supabase content) — только по отдельному запросу.

## Принятые решения

- CP-1A, CP-2, CP-3, CP-4 приняты.
- Remote Supabase: `korean-learning` / ref `cyoezrdxqncroflgkyry` / region `ap-northeast-2`.
- Dashboard: https://supabase.com/dashboard/project/cyoezrdxqncroflgkyry
- API URL: https://cyoezrdxqncroflgkyry.supabase.co
- Auth redirects: localhost + Vercel preview (`korean-learning-gray.vercel.app/auth/callback`).
- `.env.local` содержит remote keys — не коммитить.
- Remote migrations на production **не применялись** (только local + CI).
- Guest training остаётся без login; guest→account import — F1-I30.

## Открытые задачи

- [ ] Отозвать/перевыпустить Supabase access token (был в чате).
- [ ] F1-I29 Supabase content — по отдельному запросу.

## Контекст

Ветка: `feature/supabase-auth` (`feat: add Supabase authentication`).
Gate: format/lint/typecheck/248 unit/17 integration/6 db/9 rls/build на Node 24.18.0.
Auth: LoginForm OTP/magic link, `/auth/callback`, `src/proxy.ts`, profile trigger on `auth.users`.
