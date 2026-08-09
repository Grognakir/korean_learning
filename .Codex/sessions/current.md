# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-10

## Чем занимаемся

F2-I20 выполнен. **Остановка на CP-7** — без подтверждения пользователя F2-I21 не начинать.

## F2-I20 — результат

- E2E `tests/e2e/responsive-a11y.spec.ts`: checkpoint widths, smooth sweep step≤6, progress bar, three skills, catalog/dictionary keyboard, reduced motion + 200% zoom, screenshots
- Helpers: `sweepViewportWidths`, `assertSessionProgressBar`, `withPageZoom`
- Component: Select Escape/ArrowUp; TrainingSetupControls; SkillProgressList a11y
- Fix: Proxy `isKnownContentRoute` accepts `filt__*` session ids (was 404)
- E2E storage key aligned to v2

## Коммит / ветка

- Branch: `codex/f2-i20-responsive-accessibility`
- Commit: `fix: stabilize curriculum learning experience`

## Checkpoint

**CP-7:** показать пользователю три skill flows (grammar/vocabulary/reading) и оба catalog views (темы / грамматика). Ждём подтверждения.

## Следующий шаг

После CP-7 — F2-I21 quality gate.
