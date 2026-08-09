# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F1-I33: локально + push + внешний CI зелёные. Preview Ready, но Deployment Protection (Vercel SSO) блокирует автоматизированный HTTP smoke. CP-5 ждёт ручного smoke / bypass / принятия ограничения.

## Коммиты

- `9586d4f` — `chore: stabilize learning application framework`
- `3f1f63c` — `fix: supply local Supabase placeholders for CI e2e`

Ветка: `chore/framework-stabilization` (pushed).

## Внешний CI

- Run: https://github.com/Grognakir/korean_learning/actions/runs/31312096968
- Static checks and build ✓
- Supabase DB migrations and seed ✓
- Playwright e2e ✓

## Preview

- Deployment: https://korean-learning-jbzevla4e-grognakirs-projects.vercel.app
- Branch alias: https://korean-learning-git-chore-framework-5aaae0-grognakirs-projects.vercel.app
- Dashboard: https://vercel.com/grognakirs-projects/korean-learning/32RPX1iiimMNvfBQ2WJgtuQkFYbc
- Status: Ready; unauthenticated curl → Vercel SSO login

## Открытые задачи

- [ ] Preview smoke matrix (нужен browser SSO login, `VERCEL_AUTOMATION_BYPASS_SECRET`, или ослабление Protection)
- [ ] Принятие CP-5 пользователем
- [ ] Не merge в `main` / production launch / phase 2 без явного решения

## Известные ограничения

- Preview SSO как в F1-I24 risk note.
- Production catalog remote — только `sample-module`.
- Shell Node v22.15.0 vs wanted 24.18.0 (локальный caveat).
