# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

Закрыта polish-итерация `fix/cp1a-training-ui` после ручных замечаний CP-1A. Следующий шаг плана — F1-I18, но только после явного «CP-1A принят».

## Принятые решения

- Preflight: `docs/ITERATION_MANDATORY_CONDITIONS.md` + `.cursor/rules/iteration-preflight.mdc` (§4.7–4.8, инвентарь рядов).
- Select: value+шеврон в flex-потоке; Matching label+Select выровнены.
- Training layout: heading на всю ширину; кнопка под упражнением; без sticky; компактный feedback (без «Пояснение»/status, fill-blank → правильный ответ).
- `scrollbar-gutter: stable` без `both-edges`.
- Choice distractors без утечки ответа («возраст», не «возраст (уважительно)»).
- Complete-экран: без растяжки на 1fr и без `h1 max-width: 16ch`.

## Открытые задачи

- [ ] Пользователь: подтвердить **CP-1A** (`CP-1A принят`).
- [ ] Только после CP-1A: ветка `feature/local-session-persistence` → F1-I18.

## Контекст

Ветка: `fix/cp1a-training-ui`. Gate: format/lint/typecheck/189 tests/build зелёные.
