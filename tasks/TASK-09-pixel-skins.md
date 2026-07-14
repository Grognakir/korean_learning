# TASK-09 — Пиксель-арт рендер сцен: система скинов + dev-сравнение

Контекст: `tasks/ARCHITECTURE.md`. Зависимости: TASK-05, TASK-07. Логику (парсер, отношения, задания) НЕ трогать — меняется только слой рендера.

## Цель

Сцены рисуются пиксель-арт ассетами (стиль Stardew Valley) вместо кодовых SVG. Три визуальных «скина» + старый SVG как fallback, переключение в dev-режиме для сравнения. Выбранный скин потом станет основным.

## Ассеты (уже скачаны и разложены ревьюером, качать ничего не нужно)

| Папка | Пак | Лицензия | Что внутри |
|---|---|---|---|
| `public/assets/ninja-adventure/` | Ninja Adventure (pixel-boy) | **CC0** | `characters/<Name>/SeparateAnim/{Walk,Idle}.png` (16×16 кадры; Walk.png 64×64 — сетка 4×4), `tilesets/TilesetHouse.png` (здания, 16px-сетка), `TilesetField/Nature/Floor*`, `tilesets/Interior/` (интерьер) |
| `public/assets/kenney-tiny-town/`, `kenney-tiny-dungeon/` | Kenney | **CC0** | `Tiles/tile_NNNN.png` — отдельные 16×16 тайлы (дома, дороги, деревья, мебель), `Tilemap/tilemap_packed.png` |
| `public/assets/kenney-rpg/` | Kenney Roguelike/RPG | **CC0** | `Spritesheet/roguelikeSheet_transparent.png` (16px тайлы, margin 1px) |
| `public/assets/lpc/` | LPC (OpenGameArt) | **CC-BY-SA** (см. CREDITS-*.txt) | `tiles/*.png` (grass, dirt, house, victoria, inside, kitchen, cabinets, signs, treetop…), `characters/{male,female,child}/universal.png` (walk-цикл 64×64: 4 ряда направлений up/left/down/right × 9 кадров, стандарт LPC) |
| `public/assets-restricted/sprout-lands/` | Sprout Lands basic (Cup Nooble) | free, **не редистрибутить** (в .gitignore) | `Characters/Basic Charakter Spritesheet.png` (192×192 = 4×4 кадра 48×48, ряды-направления), `Tilesets/` (Grass, Water, Wooden House, Doors, Fences, Paths), `Objects/Basic Furniture.png` |
| `public/assets-restricted/limezu/` | Modern Interiors free | free, некоммерч., **не редистрибутить** | `Interiors_free/16x16/`, `Characters_free/Adam_*.png` (idle/run 16×16) |
| `public/fonts/galmuri/` | Galmuri11 | OFL | пиксельный шрифт с хангылем |

## Скины (3 + fallback)

1. **`cc0`** — Kenney (земля/дорога/мебель/здания Tiny Town) + Ninja Adventure (персонажи, дополнительные здания из TilesetHouse). Основной кандидат.
2. **`cozy`** — Sprout Lands (улица/природа/дом/персонаж) + LimeZu (класс/комната/интерьер, персонаж Adam). Файлы вне git: если папки нет — скин показывает плейсхолдер «ассеты не установлены».
3. **`lpc`** — LPC tiles + LPC universal-персонажи.
4. **`svg`** — текущий SVG-рендер (существующий `SceneCanvas` как есть).

## Архитектура

1. **`src/lib/scene/skin.ts`** — контракт скина:
   ```ts
   export type SpriteRef = {
     sheet: string;              // URL из /assets/…
     x: number; y: number;       // px в атласе
     w: number; h: number;       // px в атласе
   };
   export type PersonSprite = {
     sheet: string;
     frameW: number; frameH: number;
     idle: Record<Direction, SpriteRef>;          // Direction = "down"|"up"|"left"|"right"
     walk: Record<Direction, SpriteRef[]>;        // кадры (для TASK-10; заполнить уже сейчас)
   };
   export type Skin = {
     id: string;
     titleRu: string;
     resolve(spriteId: SpriteId): SpriteRef | null;      // null → fallback на SVG-спрайт
     person(spriteId: "person" | "person-2"): PersonSprite | null;
     background(kind: SceneKind): BackgroundSpec;         // тайлы фона по виду сцены
     available(): boolean;                                // для restricted-паков
   };
   ```
   `BackgroundSpec` — простая структура: ряды тайлов (напр., street: небо-полоса цветом, ряд травы `SpriteRef`, ряд дороги `SpriteRef`), чтобы `PixelSceneCanvas` замостил фон без tilemap-редактора.
2. **`src/lib/scene/skins/{cc0,cozy,lpc}.ts`** — манифесты координат. Координаты подбираются по 16px-сетке атласов (LPC — 32px, Sprout — 48px). Здания различать по форме/цвету/вывеске; если в паке нет «аптеки/банка» — берётся выразительное здание, подпись хангылем уже есть в рендере.
3. **`src/components/scene/PixelSceneCanvas.tsx`** — HTML-рендер (не SVG): контейнер с `aspect-ratio: cols/rows`, сущности — абсолютные `div` c `background-image/position/size` (масштаб = CELL/16 и т.п.), `image-rendering: pixelated`, transition на left/top 700ms (как сейчас). Подпись `ko` под сущностью — шрифт Galmuri (`next/font/local`, `src/app/layout.tsx`, переменная `--font-pixel`). Подсветка `highlightId` — пиксельная стрелка/маркер сверху с CSS-анимацией подпрыгивания. Спрайт персонажа пока статичный idle-кадр (walk — TASK-10).
4. **`src/components/scene/SceneView.tsx`** — обёртка: `skin === "svg"` → старый `SceneCanvas`, иначе `PixelSceneCanvas` с fallback per-sprite (resolve → null → отрисовать старый SVG-спрайт внутри div).
5. **Переключатель**: `TaskRunner` рендерит `SceneView`; активный скин — из `localStorage` (`scene-skin`), по умолчанию `svg`. Плавающая панель выбора скина видна только в dev (`process.env.NODE_ENV === "development"`) на странице темы.
6. **`src/app/dev/skins/page.tsx`** — витрина сравнения: все 4 сцены темы (из `src/content/topics/location.ts`), кнопки скинов, метка лицензии. Пометить `// dev-витрина`.
7. **Атлас-инспектор `src/app/dev/atlas/page.tsx`**: `?sheet=/assets/...&grid=16` — показывает атлас с сеткой и координатами по клику (в консоль/на экран). Нужен тебе самому для подбора координат и ревьюеру для проверки.
8. **`public/assets/ATTRIBUTION.md`** — таблица паков, авторов, лицензий, ссылок (Kenney CC0, Ninja Adventure CC0 pixel-boy, LPC CC-BY-SA с перечислением CREDITS, Galmuri OFL, Sprout Lands/LimeZu — локально, не в git).

## Порядок работы

Сначала скелет (skin.ts, PixelSceneCanvas, SceneView, переключатель, инспектор) с одним скином `cc0` и 2 сценами (street, room), потом остальные сцены и скины `lpc`, `cozy`. Координаты подбирай через атлас-инспектор итеративно — точность важнее скорости; направления кадров Walk/universal проверь визуально в инспекторе (у Ninja Adventure сетка 4×4: выясни, столбцы или ряды — направления, и зафиксируй в манифесте).

## Критерии приёмки

- `/levels/1/location`: в dev видна панель скинов; каждый из 4 скинов рендерит все 4 сцены без «дыр» (у `cc0`/`lpc` — все спрайты пиксельные или осознанный fallback; у `cozy` допустимы SVG-fallback там, где в паках нет аналога).
- Перемещение персонажа в заданиях по-прежнему плавное (transition на left/top), подсветка задания видна, подписи хангылем — Galmuri.
- `cozy` при отсутствии `public/assets-restricted/` показывает понятный плейсхолдер, прод-билд не падает.
- В production переключателя нет, активен скин из константы `DEFAULT_SKIN` (пока `"cc0"`).
- `npm test`, `npm run lint`, `npm run build` — зелёные (тесты логики не трогаются).
