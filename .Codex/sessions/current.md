# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

До F1-I18: кастомные формы/dropdown по `docs/ITERATION_MANDATORY_CONDITIONS.md` §4.7. Нативные `<form>` и `<select>` в training UI заменены. CP-1A по-прежнему ждёт явного подтверждения.

## Принятые решения

- Preflight: `docs/ITERATION_MANDATORY_CONDITIONS.md` + `.cursor/rules/iteration-preflight.mdc`.
- Общий UI-примитив `Select` (`combobox` + `listbox`), matching переведён на него.
- `TrainingSession` — кастомная композиция без native `<form>`; Enter в однострочных input по-прежнему отправляет ответ.
- F1-I18 не начинать до «CP-1A принят».

## Открытые задачи

- [ ] Пользователь: подтвердить CP-1A после проверки кастомных dropdown/форм.
- [ ] Только после CP-1A: F1-I18.

## Контекст

Ветка: `fix/cp1a-training-ui`. Baseline: 188/188 теста.
