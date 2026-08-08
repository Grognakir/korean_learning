# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

Завершены F1-I15–F1-I17A. Работа остановлена на обязательном CP-1A. F1-I18 не начинать.

## Принятые решения

- Исполнимый план: `docs/PHASE_1_REMAINING_IMPLEMENTATION_PLAN.md`.
- F1-I15: deterministic answer evaluation.
- F1-I16: training session engine.
- F1-I17: interactive training UI на sample module.
- F1-I17A: draft honorifics preview (11 exercises, topics grandparents-age + profession), только `NODE_ENV === "development"`.
- Production composition / published selectors / production build не содержат публичный `/topics/honorifics`.
- После F1-I17A обязателен CP-1A: пользователь оценивает UI на draft 높임말 (desktop + mobile).

## Открытые задачи

- [ ] Пользователь: пройти 1–2 короткие тренировки (sample и/или honorifics preview в `pnpm dev`) на desktop и mobile.
- [ ] Пользователь: явно принять CP-1A или дать замечания для отдельной `fix/*` итерации.
- [ ] Только после CP-1A: начать F1-I18 (`feature/local-session-persistence`).

## Контекст для следующей сессии

Текущая ветка — `feature/honorifics-early-slice`.
Коммиты цепочки: F1-I15 `f071d61` → F1-I16 `3ff5e18` → F1-I17 `1b039d7` → F1-I17A `5b504da`.
Baseline: 177/177 теста в 46 файлах.
Статус: **blocked on CP-1A**.
