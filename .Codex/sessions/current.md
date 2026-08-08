# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F1-I24 закрыта: Vercel project `korean-learning`, Git deploy Ready, HTTP smoke на публичном URL зелёный. Следующая итерация — F1-I25, только после явного **CP-4**.

## Принятые решения

- CP-1A, CP-2, CP-3 приняты.
- Vercel scope: `grognakirs-projects`; project: `korean-learning`.
- Git: `Grognakir/korean_learning`; ветка `chore/vercel-preview`.
- Публичный smoke URL: `https://korean-learning-gray.vercel.app`.
- `.vercel/` не коммитится; production promote не делать.
- P2: Production Branch → выставить `main` в дашборде; Node runtime Vercel `24.15.0` отстаёт от engines.

## Открытые задачи

- [ ] Пользователь: в Vercel Settings → Git → Production Branch = `main`.
- [ ] Следующая карточка: F1-I25 — только после **CP-4**.
- [ ] Не начинать Supabase без CP-4.

## Контекст

Deployment: `dpl_Dwc68xq2Gf6t6PT3QGS5eEzRrbVz` Ready; pnpm 10.34.5; Next 16.3.0.
