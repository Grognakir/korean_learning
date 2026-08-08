# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

F1-I22 завершена: Playwright e2e (Chromium desktop + mobile). Следующая итерация — F1-I23 (quality gate / CP-2), не начинать в этом шаге.

## Принятые решения

- CP-1A принят.
- E2E: `@playwright/test`, порт 3100, `next start` после `pnpm build`.
- Projects: desktop Chromium 1280×800 и mobile 375×812.
- CI e2e job: PR → main, `workflow_dispatch`, push checkpoint-веток; не на обычных iteration branches.
- Короткие сессии в e2e сидятся через `page.evaluate` после goto `/training` (не `addInitScript`).

## Открытые задачи

- [ ] Следующая карточка: F1-I23 (`chore/framework-quality-gate`) — только по запросу.
- [ ] Не пушить ветку без разрешения.

## Контекст

Ветка: `test/playwright-setup`.
Gate: 219 unit + 17 integration + 16 e2e + build зелёные.
