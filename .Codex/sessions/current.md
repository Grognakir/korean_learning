# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

Фаза 1 продолжается. Итерации F1-I01–F1-I09 завершены: приложение получило общую доступную оболочку и границы контента для всех будущих маршрутов.

## Принятые решения

- Root layout использует AuthBoundary и AppShell; на документ приходится один `main#main-content`, общий Header, footer и skip-link.
- AuthBoundary пока является публичным интерфейсным швом и без условий пропускает гостевой контент, не создавая преждевременной auth-связности.
- Добавлены PageContainer, ContentSection и TrainingShell; последний поддерживает опциональный контекст и sticky actions.
- Добавлены Header и PageHeader с корректной структурой заголовков и областей страницы.
- Метаданные используют общий title template `%s · Korean Learning`.
- Главная страница переведена на общие PageContainer, PageHeader и ContentSection.
- Браузерная проверка подтвердила один `main`, один `h1`, отсутствие overflow на 375 и 1280 px, устойчивую шапку и подвал.
- `PLAN_REVISION_2026-08-07.md` остаётся пользовательским неотслеживаемым файлом вне коммитов.

## Открытые задачи

- [ ] Выполнить F1-I10: home, topics, module detail, training, session, review, progress, dictionary, login и desktop/mobile навигацию.
- [ ] Выполнить F1-I11: responsive nav, safe-area, viewport matrix и CP-1 visual review.
- [ ] Выполнить фактический GitHub Actions run после разрешённого push.

## Контекст для следующей сессии

Текущая ветка — `feature/application-shell`; F1-I01–F1-I08 находятся в её истории. F1-I09 проходит 26/26 тестов, ESLint, Prettier, typecheck, production build и ручную проверку 375/1280 px. Следующая итерация F1-I10 должна заменить временный Header placeholder реальной навигацией и создать минимальные route placeholders без бизнес-логики.
