# Архитектура: тема «Расположение в пространстве» (1급)

Этот документ — общий контекст для всех задач в `tasks/`. Каждая задача ссылается сюда. Выполнять задачи строго по номерам (TASK-01 → TASK-08), т.к. они зависят друг от друга.

## Что строим

Первая рабочая тема уровня 1급: «Расположение предметов, зданий, помещений в пространстве» (위치).

Страница темы содержит:

1. **Динамическая сцена** (SVG) — в зависимости от задания рисуется: улица со зданиями и человеком, класс с предметами, разрез здания с этажами и помещениями, комната с людьми и предметами. Персонаж анимированно перемещается по сцене.
2. **Задания** под сценой, три типа:
   - **describe** — описать по-корейски, где находится подсвеченный объект;
   - **command** — дано условие («сделай так, чтобы Минсу был рядом с банком»), пользователь пишет предложение по-корейски; персонаж двигается туда, куда *реально написано*: написал верно — встал куда нужно, ошибся — встал не туда;
   - **fix** — показано ошибочное предложение, нужно переписать правильно, после чего объект/персонаж передвигается.
3. **Ритм-игра** для отработки слов: 3 полосы с русскими переводами внизу, сверху падают корейские слова, нужно успеть нажать полосу с правильным значением.

Проверка предложений — **rule-based парсер** (без API, оффлайн). Ввод — печать хангыля с клавиатуры.

## Стек и конвенции проекта

- Next.js 16 (App Router, **Cache Components**: `cacheComponents: true`), React 19, Tailwind 4, TypeScript strict.
- ⚠️ **Next.js 16 имеет breaking changes** — перед написанием кода читать доки в `node_modules/next/dist/docs/` (см. AGENTS.md). Ключевое:
  - `params` в страницах — это `Promise`, нужен `await params`;
  - статические страницы — `"use cache"` + `cacheLife("max")` в теле компонента (см. `src/app/page.tsx`);
  - интерактив — клиентские компоненты (`"use client"`).
- Алиас импортов: `@/*` → `src/*`.
- Стили: Tailwind-классы + CSS-переменные из `src/app/globals.css`: `--accent`, `--accent-2`, `--ink`, `--ink-soft`, `--ok`, `--bad`, `--warn`, `--line`; утилиты `.panel` (карточка), `.ko-text` (корейский шрифт), `.font-display` (заголовки). Корейский текст всегда с классом `ko-text`.
- Язык интерфейса — русский, учебный контент — корейский.
- Комментарии в коде не писать, кроме мест с неочевидными ограничениями.
- Тесты: vitest (добавляется в TASK-02), `npm test`.

## Структура модулей

```
src/
  app/
    levels/[levelId]/page.tsx              — список тем уровня (TASK-01)
    levels/[levelId]/[topicSlug]/page.tsx  — страница темы (TASK-01)
  lib/
    types.ts          — общие типы уровней/тем (расширяется в TASK-01)
    ko/
      hangul.ts       — утилиты хангыля: 받침 и т.п. (TASK-02)
      lexicon.ts      — словарь темы (TASK-02)
      parse.ts        — парсер предложений (TASK-03)
    scene/
      types.ts        — модель сцены (TASK-04)
      relations.ts    — пространственная логика (TASK-04)
  components/
    scene/
      sprites.tsx     — SVG-спрайты (TASK-05)
      SceneCanvas.tsx — рендер сцены + анимация (TASK-05)
    topics/location/
      LocationTopic.tsx — вкладки «Задания»/«Слова» (TASK-07)
      TaskRunner.tsx    — движок заданий (TASK-07)
      RhythmGame.tsx    — ритм-игра (TASK-08)
  content/
    levels.ts               — уровни (правится в TASK-01)
    topics/location.ts      — сцены, задания, словарь темы (TASK-06)
```

## Ключевые контракты (обязательны, менять только по согласованию)

### Пространственные отношения

```ts
// src/lib/scene/types.ts
export type SpatialRelation =
  | "front"    // 앞
  | "behind"   // 뒤
  | "beside"   // 옆
  | "left"     // 왼쪽
  | "right"    // 오른쪽
  | "above"    // 위
  | "below"    // 아래 / 밑
  | "inside"   // 안
  | "outside"  // 밖
  | "between"  // 사이 (два ориентира)
  | "near";    // 근처
```

### Модель сцены

```ts
export type SceneKind = "street" | "classroom" | "building-cut" | "room";
export type EntityKind = "person" | "building" | "object" | "room" | "decor";

export type SceneEntity = {
  id: string;          // уникален в сцене; для существительных совпадает с lexemeId из lexicon
  kind: EntityKind;
  sprite: SpriteId;    // см. TASK-05
  ko: string;          // 학교
  ru: string;          // школа
  col: number;         // сетка, 0-based
  row: number;
  w?: number;          // ширина в ячейках, по умолчанию 1
  h?: number;
  containerId?: string; // сущность находится внутри другой (для inside/outside)
  movable?: boolean;    // может перемещаться (персонаж, переносимые предметы)
};

export type Scene = {
  id: string;
  kind: SceneKind;
  cols: number;
  rows: number;
  entities: SceneEntity[];
};
```

Семантика координат: **вид сбоку/срез**. `col` растёт вправо, `row` растёт вниз (row 0 — верх: верхний этаж, полка и т.п.). Отношения считаются из координат (TASK-04).

### Парсер

```ts
// src/lib/ko/parse.ts
export type ParsedSentence = {
  ok: true;
  subjectId: string;        // lexemeId подлежащего
  relation: SpatialRelation;
  refIds: string[];         // 1 ориентир, для between — 2
};
export type ParseError = {
  ok: false;
  errorRu: string;          // что не так, по-русски
  hintRu?: string;          // как исправить
};
export type ParseResult = ParsedSentence | ParseError;

export function parseLocationSentence(input: string, lexemeIds: string[]): ParseResult;
```

Поддерживаемый шаблон предложения (все вежливости: 있어요 / 있습니다 / 있다):

```
[N][이/가/은/는] [REF][의]? [POS]에 있어요
[N][이/가/은/는] [REF1][하고/과/와] [REF2] 사이에 있어요
```

Парсер валидирует частицы по 받침 (이/가, 은/는, 과/와) и даёт русские подсказки при ошибке.

### Логика отношений

```ts
// src/lib/scene/relations.ts
export type RelationFact = { relation: SpatialRelation; refIds: string[] };

export function getTrueRelations(scene: Scene, subjectId: string): RelationFact[];
export function holds(scene: Scene, subjectId: string, fact: RelationFact): boolean;
export function resolveTargetCell(
  scene: Scene, subjectId: string, fact: RelationFact
): { col: number; row: number; containerId?: string } | null;
```

`resolveTargetCell` — куда переместить субъект, чтобы отношение стало истинным (для command/fix-заданий). `null` — если в сцене нет подходящей свободной ячейки.

### Контент заданий

```ts
// src/content/topics/location.ts
export type LocationTask =
  | { type: "describe"; sceneId: string; subjectId: string; promptRu: string }
  | { type: "command";  sceneId: string; subjectId: string; goal: RelationFact; promptRu: string }
  | { type: "fix";      sceneId: string; subjectId: string; goal: RelationFact;
      wrongSentence: string; promptRu: string };

export type VocabWord = { ko: string; ru: string };
```

## Поток данных

1. Страница темы (server, `"use cache"`) рендерит `LocationTopic` (client) с контентом из `src/content/topics/location.ts`.
2. `TaskRunner` держит state: текущее задание, копия сцены (позиции меняются), ввод, результат.
3. Проверка: ввод → `parseLocationSentence` → при ошибке — подсказка; при успехе:
   - describe: `holds(scene, subjectId, fact)` — любое истинное отношение подсвеченного объекта засчитывается;
   - command/fix: `resolveTargetCell` по *написанному* → анимированное перемещение → сравнение написанного факта с `goal` → верно/неверно + объяснение.
4. Ритм-игра берёт `VocabWord[]` из того же контента.

## Скины сцен (пиксель-арт, TASK-09+)

Рендер сцены абстрагирован контрактом `Skin` (`src/lib/scene/skin.ts`): скин отдаёт координаты спрайтов в PNG-атласах (`public/assets/`), кадры персонажей и спецификацию фона; `SceneView` выбирает `PixelSceneCanvas` (HTML, background-position, pixelated) или старый SVG `SceneCanvas`. Скины: `cc0` (Kenney + Ninja Adventure, CC0), `cozy` (Sprout Lands + LimeZu, локально, вне git), `lpc` (CC-BY-SA), `svg` (fallback). Лицензии — `public/assets/ATTRIBUTION.md`.

## Definition of Done для каждой задачи

- `npm run lint` и `npm run build` проходят без ошибок.
- `npm test` проходит (для задач с тестами).
- Код соответствует контрактам выше; отступления описаны в комментарии к задаче.
- UI-задачи проверены вручную в `npm run dev`.
