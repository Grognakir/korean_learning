# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F1-I33 (стабилизация фазы 1) выполнен локально на ветке `chore/framework-stabilization`. Preview honorifics удалён; три последовательных full gate зелёные. Push / внешний CI / Preview smoke / CP-5 — только после явного разрешения.

## F1-I33 — результат

- Удалены `src/modules/honorifics/**` и `composeDevelopmentContent.ts`.
- Composition всегда production/sample; `/training/honorifics-preview` → 404.
- Static params сессии — только `demo-session`.
- Регрессионные проверки: unit/route + e2e 404 + production-build exclusion.

## Gate (локально, 3× подряд)

- format / lint / typecheck green
- unit 309, integration 17, e2e 20, db 16, rls 10
- build + bundle budgets
- Node caveat: shell сейчас Node v22.15.0 (wanted 24.18.0); ранее согласовано продолжать с этим предупреждением

## Открытые задачи

- [ ] Push `chore/framework-stabilization` — только по разрешению
- [ ] Дождаться зелёного внешнего CI (включая DB/RLS)
- [ ] Preview smoke matrix + CP-5 отчёт
- [ ] Не начинать production launch / phase 2 без явного решения

## Известные ограничения

- Production catalog в remote Supabase — только published `sample-module`.
- CP-5 незавершён до push + CI + preview smoke + принятия пользователем.
