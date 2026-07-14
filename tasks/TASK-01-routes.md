# TASK-01 — Роуты уровней и тем, навигация

Контекст: `tasks/ARCHITECTURE.md`. Зависимости: нет.

## Цель

Кликабельный путь: главная → 1급 → список тем → страница темы «Расположение в пространстве» (пока с заглушками вместо игр).

## Что сделать

1. **`src/lib/types.ts`** — добавить типы тем:
   ```ts
   export type TopicMeta = {
     slug: string;         // "location"
     titleKo: string;      // "위치"
     titleRu: string;      // "Расположение в пространстве"
     description: string;  // короткое описание по-русски
     available: boolean;
   };
   ```
2. **`src/content/levels.ts`** — уровень `1`: `available: true`. Добавить экспорт `topicsByLevel: Record<LevelId, TopicMeta[]>`: у 1급 одна тема `location` (`available: true`), у остальных уровней пустые массивы.
3. **`src/app/page.tsx`** — карточки доступных уровней обернуть в `<Link href={`/levels/${level.id}`} prefetch>`, недоступные оставить как есть (с бейджем «скоро»). Hover-состояние карточки-ссылки (рамка/тень через существующие CSS-переменные).
4. **`src/app/levels/[levelId]/page.tsx`** — список тем уровня:
   - `params: Promise<{ levelId: string }>`, `await params`;
   - `"use cache"` + `cacheLife("max")`;
   - неизвестный `levelId` или `available: false` → `notFound()`;
   - шапка с названием уровня, сетка карточек тем; доступная тема — ссылка на `/levels/1/location`.
5. **`src/app/levels/[levelId]/[topicSlug]/page.tsx`** — страница темы:
   - валидация `levelId` + `topicSlug` по `topicsByLevel`, иначе `notFound()`;
   - заголовок (titleKo крупно + titleRu), хлебная крошка «← 1급»;
   - два блока-заглушки в `.panel`: «Задания» и «Игра слов» с текстом «скоро» — их заменят TASK-07/TASK-08.
6. Стиль — в духе существующих страниц: `panel`, `ko-text`, `font-display`, CSS-переменные. Никаких новых зависимостей.

## Критерии приёмки

- `/` → клик по 1급 → `/levels/1` → клик по теме → `/levels/1/location`; карточки 2–6급 некликабельны.
- `/levels/9`, `/levels/2`, `/levels/1/foo` → 404.
- `npm run lint`, `npm run build` — без ошибок.
