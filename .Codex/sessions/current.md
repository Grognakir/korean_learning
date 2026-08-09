# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

Реализован план `docs/PERFORMANCE_AND_VERCEL_FIX_PLAN.md` (PERF-I00—I08) в ветке `feature/performance-vercel-fixes`.

## Принятые решения

- Production Vercel env дополнен: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `CONTENT_SOURCE=supabase`.
- Prebuild `scripts/validate-deployment-env.ts` валидирует Supabase env на Vercel/CI до `next build`.
- Auth вынесен в `HeaderAuthSection` + `Suspense`; root layout больше не блокирует весь shell на `getServerAuthUser()`.
- `getServerAuthUser()` memoized через `React.cache()`.
- Узкие loaders: `getModuleContent`, `getExerciseContent`, `getExerciseCountByModuleSlug`.
- Barrel imports на catalog/training/progress страницах заменены на прямые entry points; добавлены `training/client.ts`, `training/server.ts`, `training/domain-public.ts`.
- Cloud bootstrap больше не заменяет экран упражнения — показывает Alert и блокирует submit до ready.
- `engines.node` согласован с Vercel: `>=24.15.0 <25`.
- Gate: 277/277 tests, lint, typecheck, build, bundle budgets green.

## Открытые задачи

- [ ] Push ветки и deploy на Vercel (Production redeploy старого commit без нового кода упал на build).
- [ ] Публичный smoke `PERF_BASE_URL=https://korean-learning-gray.vercel.app pnpm perf:smoke` после deploy.
- [ ] Commit по запросу пользователя.

## Контекст

Локальный bundle gzip: `/topics` и `/training` ~160 KB (budget 180 KB). Production alias должен заработать после deploy с env + новым кодом.
