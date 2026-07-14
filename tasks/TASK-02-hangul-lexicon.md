# TASK-02 — Утилиты хангыля, словарь темы, vitest

Контекст: `tasks/ARCHITECTURE.md`. Зависимости: нет (можно параллельно с TASK-01).

## Цель

Фундамент для парсера: работа с 받침 и словарь темы. Плюс настроить vitest.

## Что сделать

1. **Vitest**: `npm i -D vitest`, скрипт `"test": "vitest run"`. Конфиг не нужен, если тесты лежат рядом с кодом как `*.test.ts` и резолвится алиас `@/` (если нет — добавить `vitest.config.ts` с алиасом `@` → `./src`).

2. **`src/lib/ko/hangul.ts`**:
   ```ts
   export function hasBatchim(word: string): boolean;      // по последнему слогу
   export function isHangul(text: string): boolean;        // все символы — хангыль/пробелы
   export function subjectParticle(word: string): "이" | "가";
   export function topicParticle(word: string): "은" | "는";
   export function andParticle(word: string): "과" | "와";
   ```
   Разложение слога через код-поинты (U+AC00…U+D7A3): `(code - 0xAC00) % 28 !== 0` → есть 받침. Особый случай: 받침 ㄹ для 와/과 НЕ особый — только стандартное правило (과 после 받침, 와 без).

3. **`src/lib/ko/lexicon.ts`** — словарь темы:
   ```ts
   export type LexemeCategory = "person" | "building" | "object" | "room" | "place";
   export type Lexeme = { id: string; ko: string; ru: string; category: LexemeCategory };
   export const lexemes: Lexeme[];
   export const lexemeByKo: Map<string, Lexeme>;
   export function findLexeme(ko: string): Lexeme | undefined;

   export type PositionWord = { relation: SpatialRelation; ko: string[] }; // синонимы: 아래/밑
   export const positionWords: PositionWord[];
   ```
   - Существительные (id = романизация): 학교/школа, 병원/больница, 은행/банк, 약국/аптека, 서점/книжный магазин, 편의점/минимаркет, 식당/столовая, 카페/кафе, 집/дом, 나무/дерево, 교실/класс (помещение), 화장실/туалет, 사무실/офис, 도서관/библиотека, 책상/парта (стол), 의자/стул, 칠판/доска, 창문/окно, 문/дверь, 시계/часы, 가방/сумка, 책/книга, 컴퓨터/компьютер, 침대/кровать, 소파/диван, 탁자/столик, 사람/человек.
   - Имена (category "person"): 민수, 유나, 지훈, 수진.
   - `positionWords` — соответствие `SpatialRelation` (тип импортировать из `@/lib/scene/types`; если TASK-04 ещё не выполнен — создать `src/lib/scene/types.ts` с одним экспортом `SpatialRelation` ровно по ARCHITECTURE.md): 앞→front, 뒤→behind, 옆→beside, 왼쪽→left, 오른쪽→right, 위→above, 아래|밑→below, 안→inside, 밖→outside, 사이→between, 근처→near.

4. **`src/lib/ko/hangul.test.ts`** — тесты: 학교→가/는/와, 집→이/은/과, 서울→이 (받침 ㄹ), пустая строка/латиница не роняют функции.

## Критерии приёмки

- `npm test` зелёный; `npm run lint`, `npm run build` — без ошибок.
- `hasBatchim("학교")===false`, `hasBatchim("은행")===true`, `subjectParticle("약국")==="이"`, `andParticle("카페")==="와"`.
