# TASK-05 — SVG-спрайты и рендер сцены

Контекст: `tasks/ARCHITECTURE.md`. Зависимости: TASK-04.

## Цель

`src/components/scene/sprites.tsx` и `src/components/scene/SceneCanvas.tsx`: отрисовка любой `Scene` в SVG с плавным перемещением сущностей. Без внешних ассетов и библиотек.

## sprites.tsx

`SpriteId` (union в `src/lib/scene/types.ts`, объявлен в TASK-04 — синхронизировать):
`"school" | "hospital" | "bank" | "pharmacy" | "bookstore" | "convenience" | "restaurant" | "cafe" | "house" | "tree" | "road" | "person" | "person-2" | "desk" | "chair" | "blackboard" | "window" | "door" | "clock" | "bag" | "book" | "computer" | "bed" | "sofa" | "table" | "room" | "toilet" | "office" | "library"`

- Каждый спрайт — функция, рисующая в нормированный бокс 100×100 (viewBox управляет `SceneCanvas`), простая плоская векторная графика в палитре проекта (`--accent`, `--accent-2`, `--ink-soft` + пастельные заливки). Здания различимы (крест у 병원, ₩ у 은행, чашка у 카페 и т.п.).
- `person` / `person-2` — два разных цвета одежды, простая фигурка.
- `room` — прямоугольник-помещение с подписью (для разреза здания).
- Экспорт: `export function Sprite({ id }: { id: SpriteId })` с `switch` по id.

## SceneCanvas.tsx (client component)

```ts
type SceneCanvasProps = {
  scene: Scene;                    // текущее состояние (позиции могут меняться извне)
  highlightId?: string;            // подсветить сущность (describe-задания)
  className?: string;
};
```

- SVG с `viewBox = cols*CELL × rows*CELL` (CELL = 100), `width 100%`, адаптивно.
- Фон зависит от `scene.kind`: street — небо/земля/полоса дороги; classroom/room — пол и стена; building-cut — контур здания и линии этажей.
- Каждая сущность — `<g transform="translate(col*CELL, row*CELL)">` со спрайтом и подписью `ko` под ним (`ko-text`, мелко). У `decor` подписи нет.
- **Анимация**: `transition: transform 700ms ease-in-out` на `<g>` — при изменении `col`/`row` сущность плавно едет (SVG transform анимируется CSS-ом; проверить в браузере, при проблемах — обернуть каждый спрайт в `<foreignObject>` НЕ надо, вместо этого использовать атрибут style с translate в px).
- `highlightId`: пульсирующее кольцо/подложка под сущностью (CSS-анимация `@keyframes`).
- Сущности с `containerId` рисуются внутри контейнера (координаты у них всё равно абсолютные в сетке — контейнер просто визуально их охватывает).

## Витрина для проверки

Временная страница `src/app/dev/scene/page.tsx` (client): рендерит 2 тестовые сцены (street и building-cut, взять из тестов TASK-04) и кнопку «подвинуть человека» (меняет col на ±1) для проверки анимации. Страницу пометить комментарием `// dev-витрина, удалить в TASK-07`.

## Критерии приёмки

- `/dev/scene`: обе сцены читаемы, все спрайты отображаются, подписи на корейском, человек плавно (не скачком) перемещается по кнопке, подсветка работает.
- Сцена адаптивна по ширине контейнера; `npm run lint`, `npm run build` — зелёные.
