# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

F1-I21 завершена: интеграционные тесты каркаса. Следующая итерация — F1-I22 (Playwright), не начинать в этом шаге.

## Принятые решения

- CP-1A принят.
- Unit (`pnpm test:run`) исключает `tests/integration/**`.
- Integration (`pnpm test:integration`) — отдельный config, 17 тестов.
- CI `push.branches`: `main`, `chore/framework-quality-gate`, `chore/framework-stabilization`.
- Factories + fake clock/memory storage в `tests/factories` и `tests/helpers/integration.ts`.

## Открытые задачи

- [ ] Следующая карточка: F1-I22 (`test/playwright-setup`) — только по запросу.
- [ ] Не пушить ветку без разрешения.

## Контекст

Ветка: `test/framework-integration`.
Gate: 219 unit + 17 integration + build зелёные.
