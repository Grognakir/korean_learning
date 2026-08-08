# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

Завершены F1-I15, F1-I16 и F1-I17. Следующая итерация — F1-I17A (draft 높임말 vertical slice), после которой обязателен CP-1A.

## Принятые решения

- Документы только в `docs/`; `.Codex/sessions/current.md` — служебное исключение.
- Одна итерация = отдельная ветка + один commit + локальный gate + остановка перед следующим кодом.
- Evaluation/session domain без React; UI использует engine через `useTrainingSession`.
- `toExerciseView` отдаёт UI-view без answer keys; полный `Exercise` остаётся для client-side evaluator только на временном sample path.
- Локальный маршрут сессии: `/training/demo-session`.
- Local/CI: Node.js `24.18.0`, pnpm `10.34.5`.
- После F1-I17A нельзя начинать F1-I18 без явного CP-1A.

## Открытые задачи

- [ ] Выполнить F1-I17A (`feature/honorifics-early-slice`) и остановиться с запросом CP-1A.
- [ ] Не начинать F1-I18 до принятия CP-1A.

## Контекст для следующей сессии

Текущая ветка — `feature/training-interface`.
- F1-I15: evaluation domain
- F1-I16: session engine
- F1-I17: training UI (`TrainingSession`, renderers, `/training`, `/training/demo-session`)
Baseline: 167/167 теста в 43 файлах. Следующий шаг — F1-I17A.
