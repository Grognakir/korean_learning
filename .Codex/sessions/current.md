# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F1-I32 (mistake review queue) выполнен локально на ветке `feature/error-review`. PERF plan закрыт ранее. Следующий шаг фазы 1 — F1-I33 (стабилизация), без запуска в этой же итерации.

## F1-I32 — результат

- Ошибка в practice upsert'ит `review_queue` (`due`, stage 0); practice correct очередь не трогает.
- Review correct двигает фиксированную цепочку +1d / +3d / +7d → `mastered` (`due_at` null).
- Review wrong и новая ошибка по mastered возвращают `due` / stage 0.
- `/review` показывает guest/empty/summary; CTA стартует cloud session `mode: review` через `POST /api/training/review-sessions`.
- Переходы выполняются в той же транзакции, что `submit_training_attempt` (SECURITY DEFINER).

## Ключевые файлы

- `supabase/migrations/20260809000009_review_queue_policy.sql`
- `src/features/review/**`
- `src/app/review/*`, `src/app/api/training/review-sessions/route.ts`
- DB helpers: `node_modules/.bin/supabase` вместо `pnpm exec` (PATH без pnpm)

## Gate (локально)

- format / lint / typecheck green
- unit 316, integration 17, e2e 20, db 16, rls 10
- build + bundle budgets (`/review` 16 KB gzip)

## Открытые задачи

- [ ] Push/merge `feature/error-review` — только по разрешению
- [ ] Remote migration на Supabase — CP-4 / явное разрешение (локально migration применена)
- [ ] F1-I33 — стабилизация фазы 1

## Отклонения от карточки

- `due_at` сделан nullable (иначе `mastered` + `dueAt = null` невозможно).
- Починены хрупкие DB helper'ы и progress tests (фиксированный `completed_at` в прошлом, неверный topic id, race fileParallelism).
