# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

Фаза 1 продолжается. Итерации F1-I01–F1-I07 завершены: приложение имеет воспроизводимый quality/test harness, визуальный фундамент и первую доступную UI-библиотеку.

## Принятые решения

- Реализованы Button, Input, Textarea, Card и Badge; каждый компонент имеет CSS Module, ближайший component test и публичный `index.ts`.
- В React 19 ref передаётся как обычный prop через `ComponentPropsWithRef`; `forwardRef` не используется, поскольку React пометил его как будущий deprecated API.
- Button поддерживает только реальные варианты `primary`, `secondary`, `ghost`; минимальная высота всех кнопок — 44 px.
- Badge поддерживает смысловые тона `neutral`, `accent`, `success`, `warning`, `danger`; для компонентов добавлены недостающие semantic tokens.
- Input и Textarea требуют доступный `label`, генерируют стабильные id, объединяют внешнее и внутренние `aria-describedby`, выставляют `aria-invalid` при ошибке и сохраняют все нативные props.
- Для интерактивных тестов добавлен `@testing-library/user-event` 14.6.3.
- Главная страница временно служит адаптивным showcase UI-примитивов до появления полноценной оболочки и маршрутов.
- Браузерная проверка подтвердила hover/active/focus/disabled, ввод корейского текста, отсутствие mobile overflow и console issues.
- `PLAN_REVISION_2026-08-07.md` остаётся пользовательским неотслеживаемым файлом вне коммитов.

## Открытые задачи

- [ ] Выполнить F1-I08 в отдельной ветке: ProgressBar, Spinner, Modal, EmptyState и Alert.
- [ ] Зафиксировать aria-live conventions и проверить keyboard/focus behavior Modal.
- [ ] Продолжать малые итерации до пользовательской контрольной точки CP-1 после F1-I11.
- [ ] Выполнить фактический GitHub Actions run после разрешённого push.

## Контекст для следующей сессии

Текущая ветка — `feature/ui-primitives`; F1-I01–F1-I06 находятся в её истории. F1-I07 добавляет `src/components/ui`, расширяет semantic tokens, подключает user-event и выводит showcase на `/`. Frozen install, Prettier, ESLint, 11/11 тестов, typecheck, production build и ручная desktop/mobile проверка проходят. Следующая итерация F1-I08 должна переиспользовать существующие токены и примитивы, не добавляя доменную логику.
