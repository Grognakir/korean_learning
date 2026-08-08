# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

Завершена итерация F1-I15: детерминированная проверка ответов. Следующая итерация F1-I16 ещё не начата.

## Принятые решения

- Все проектные документы создаются и хранятся в `docs/`; `.Codex/sessions/current.md` остаётся обязательным служебным исключением.
- `docs/PHASE_1_REMAINING_IMPLEMENTATION_PLAN.md` является приоритетной пошаговой инструкцией для F1-I15–F1-I33.
- Исполнитель реализует ровно одну итерацию, запускает её тесты, обновляет статусы, создаёт один коммит и останавливается, не начиная следующий шаг.
- CP-1A, CP-2, CP-3, CP-4 и CP-5 являются жёсткими остановками.
- Evaluation domain остаётся чистым: без React, repository implementation, Supabase и OpenAI.
- Базовая нормализация ответа: Unicode NFC, trim, схлопывание пробельных последовательностей; без fuzzy matching и корейской морфологической нормализации.
- Partial credit применяется только при `exercise.scoring.partialCredit === true`.
- Local/CI используют Node.js `24.18.0` и pnpm `10.34.5`.
- Промежуточные iteration branches не пушатся; отдельные PR на каждую итерацию не открываются.

## Открытые задачи

- [ ] Выполнить только F1-I16 (`feature/training-session-engine`) по карточке плана и остановиться перед F1-I17.
- [ ] Не начинать F1-I17A и последующие шаги до завершения предыдущих и подтверждения checkpoint'ов.

## Контекст для следующей сессии

Текущая ветка — `feature/answer-evaluation`. F1-I15 добавила `src/features/training/domain/evaluation/*` с `evaluateAnswer` / `CheckerRegistry`, checkers для choice/free-response/fill-blank/matching и table-driven тестами. Все 14 sample exercises оцениваются. Baseline после итерации: 124/124 теста в 34 файлах. Следующий технический шаг — F1-I16, session engine.
