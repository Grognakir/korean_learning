# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

Выполнена fix-итерация `fix/cp1a-training-ui` по `docs/PHASE_1_UI_AUDIT_FINDINGS.md` (UI-001–UI-006). F1-I18 не начата. CP-1A ожидает повторной визуальной приёмки.

## Принятые решения

- После F1-I17A CP-1A был отклонён из-за UI-аудита; исправления вынесены в отдельную ветку `fix/cp1a-training-ui`.
- UI-001/002: на `<48rem` actions в потоке документа; sticky только с `48rem` и offset страницы; без подъёма z-index над mobile nav.
- UI-003: `scrollbar-gutter: stable both-edges` на `html`.
- UI-004: прогресс выполнения — текст позиции отдельно, `ProgressBar.value = answeredCount`.
- UI-005: form submit для `Ответить`; `Дальше` остаётся `type="button"`.
- UI-006: `lang="ko"` на корейских badge; preview description с вложенным `<span lang="ko">`.
- F1-I18 запрещена до явного «CP-1A принят».

## Открытые задачи

- [ ] Пользователь: повторно проверить desktop/mobile учебную сессию (особенно 375×667 и 390×844).
- [ ] Пользователь: явно принять CP-1A или дать новые замечания.
- [ ] Только после CP-1A: F1-I18 local session persistence.

## Контекст для следующей сессии

Ветка: `fix/cp1a-training-ui`.
Цепочка: F1-I15…F1-I17A (`5b504da`) → fix CP-1A (этот коммит).
Baseline: 186/186 теста в 46 файлах.
Статус: **ожидает повторного CP-1A**.
