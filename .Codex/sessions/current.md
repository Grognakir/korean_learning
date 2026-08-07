# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

Фаза 1 продолжается. Итерации F1-I01–F1-I10 завершены: вся будущая карта MVP доступна через рабочие маршруты и общую desktop/mobile навигацию.

## Принятые решения

- Добавлены home, topics, module detail, training, session, review, progress, dictionary и login; у каждого маршрута один `h1` и собственный title.
- Динамические примеры `/topics/sample-module` и `/training/demo-session` пререндерятся через `generateStaticParams`.
- PrimaryNavigation и MobileNavigation используют единый массив `NAVIGATION_ITEMS`; active-state охватывает вложенные маршруты.
- Desktop navigation живёт в Header, mobile navigation — в фиксированной нижней панели с четырьмя основными целями.
- Временный UI showcase на главной заменён стартовой картой приложения; удалён одноразовый `FeedbackPreview`.
- RoutePlaceholder даёт всем будущим разделам единый доступный каркас и только существующие внутренние ссылки.
- Ручная проверка прошла все маршруты, прямые URL, back/forward, вложенный active-state, 404 и отсутствие overflow на 375/1280 px.
- `PLAN_REVISION_2026-08-07.md` остаётся пользовательским неотслеживаемым файлом вне коммитов.

## Открытые задачи

- [ ] Выполнить F1-I11: responsive nav, safe-area, breakpoints, touch targets, viewport matrix, zoom 200% и CP-1 visual review.
- [ ] После CP-1 перейти к F1-I12 — универсальной модели учебных модулей.
- [ ] Выполнить фактический GitHub Actions run после разрешённого push.

## Контекст для следующей сессии

Текущая ветка — `feature/routes-and-navigation`; F1-I01–F1-I09 находятся в её истории. F1-I10 проходит 39/39 тестов, ESLint, Prettier, typecheck, production build и полный browser route smoke. Следующая итерация F1-I11 должна доработать уже существующую оболочку под 320/375/768/1280 px и завершить CP-1, не добавляя новых продуктовых функций.
