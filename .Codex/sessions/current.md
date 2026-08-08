# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

Завершены F1-I15 и F1-I16. Следующая итерация F1-I17 (интерактивный экран тренировки) ещё не начата.

## Принятые решения

- Все проектные документы создаются и хранятся в `docs/`; `.Codex/sessions/current.md` остаётся обязательным служебным исключением.
- `docs/PHASE_1_REMAINING_IMPLEMENTATION_PLAN.md` — приоритетная пошаговая инструкция для F1-I15–F1-I33.
- Одна итерация = один branch + один commit + полный локальный gate + остановка перед следующим кодом.
- Evaluation и session domain остаются чистыми: без React, localStorage, Supabase и OpenAI.
- Session score вычисляется selectors из immutable attempts; UUID/время инъецируются снаружи.
- Seeded shuffle реализован локальным mulberry32 PRNG без внешней библиотеки.
- Local/CI: Node.js `24.18.0`, pnpm `10.34.5`.
- Промежуточные iteration branches не пушатся.

## Открытые задачи

- [ ] Выполнить только F1-I17 (`feature/training-interface`) и остановиться перед F1-I17A.
- [ ] После F1-I17A запросить CP-1A до F1-I18.

## Контекст для следующей сессии

Текущая ветка — `feature/training-session-engine`.
- F1-I15: `src/features/training/domain/evaluation/*` — `evaluateAnswer` / checkers.
- F1-I16: `src/features/training/domain/session/*` — create/reducer/submit/selectors/seededShuffle.
Baseline: 141/141 теста в 35 файлах. Следующий шаг — F1-I17, interactive training UI на `/training` и `/training/demo-session`.
