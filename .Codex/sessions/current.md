# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

F1-I18 завершена: локальное сохранение active training session. Следующая итерация — F1-I19 (результаты), не начинать в этом шаге.

## Принятые решения

- CP-1A принят пользователем.
- Persistence: key `korean-learning:training-session:v1`, TTL 7 дней, Zod после parse.
- Save после create/submit/next; completed не очищается в F1-I18.
- SSR: чтение localStorage только после mount; `/training` показывает ResumeTrainingPrompt.

## Открытые задачи

- [ ] Следующая карточка: F1-I19 (`feature/training-results`) — только по запросу / следующему шагу плана.
- [ ] Не пушить ветку без разрешения.

## Контекст

Ветка: `feature/local-session-persistence`. Gate: 202 tests + build зелёные.
