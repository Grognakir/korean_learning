import type { SpatialRelation } from "@/lib/scene/types";

export type LexemeCategory = "person" | "building" | "object" | "room" | "place";

export type RuLoc = {
  ins: string;
  gen: string;
};

export type Lexeme = {
  id: string;
  ko: string;
  ru: string;
  ruLoc: RuLoc;
  category: LexemeCategory;
};

export const lexemes: Lexeme[] = [
  { id: "hakgyo", ko: "학교", ru: "школа", ruLoc: { ins: "школой", gen: "школы" }, category: "building" },
  { id: "byeongwon", ko: "병원", ru: "больница", ruLoc: { ins: "больницей", gen: "больницы" }, category: "building" },
  { id: "eunhaeng", ko: "은행", ru: "банк", ruLoc: { ins: "банком", gen: "банка" }, category: "building" },
  { id: "yakguk", ko: "약국", ru: "аптека", ruLoc: { ins: "аптекой", gen: "аптеки" }, category: "building" },
  {
    id: "seojeom",
    ko: "서점",
    ru: "книжный магазин",
    ruLoc: { ins: "книжным магазином", gen: "книжного магазина" },
    category: "building",
  },
  {
    id: "pyeonuijeom",
    ko: "편의점",
    ru: "минимаркет",
    ruLoc: { ins: "минимаркетом", gen: "минимаркета" },
    category: "building",
  },
  { id: "sikdang", ko: "식당", ru: "столовая", ruLoc: { ins: "столовой", gen: "столовой" }, category: "building" },
  { id: "kape", ko: "카페", ru: "кафе", ruLoc: { ins: "кафе", gen: "кафе" }, category: "building" },
  { id: "jip", ko: "집", ru: "дом", ruLoc: { ins: "домом", gen: "дома" }, category: "building" },
  { id: "namu", ko: "나무", ru: "дерево", ruLoc: { ins: "деревом", gen: "дерева" }, category: "place" },
  { id: "gyosil", ko: "교실", ru: "класс", ruLoc: { ins: "классом", gen: "класса" }, category: "room" },
  { id: "hwajangsil", ko: "화장실", ru: "туалет", ruLoc: { ins: "туалетом", gen: "туалета" }, category: "room" },
  { id: "samusil", ko: "사무실", ru: "офис", ruLoc: { ins: "офисом", gen: "офиса" }, category: "room" },
  {
    id: "doseogwan",
    ko: "도서관",
    ru: "библиотека",
    ruLoc: { ins: "библиотекой", gen: "библиотеки" },
    category: "room",
  },
  { id: "chaeksang", ko: "책상", ru: "парта", ruLoc: { ins: "партой", gen: "парты" }, category: "object" },
  { id: "uija", ko: "의자", ru: "стул", ruLoc: { ins: "стулом", gen: "стула" }, category: "object" },
  { id: "chilpan", ko: "칠판", ru: "доска", ruLoc: { ins: "доской", gen: "доски" }, category: "object" },
  { id: "changmun", ko: "창문", ru: "окно", ruLoc: { ins: "окном", gen: "окна" }, category: "object" },
  { id: "mun", ko: "문", ru: "дверь", ruLoc: { ins: "дверью", gen: "двери" }, category: "object" },
  { id: "sigye", ko: "시계", ru: "часы", ruLoc: { ins: "часами", gen: "часов" }, category: "object" },
  { id: "gabang", ko: "가방", ru: "сумка", ruLoc: { ins: "сумкой", gen: "сумки" }, category: "object" },
  { id: "chaek", ko: "책", ru: "книга", ruLoc: { ins: "книгой", gen: "книги" }, category: "object" },
  {
    id: "keompyuteo",
    ko: "컴퓨터",
    ru: "компьютер",
    ruLoc: { ins: "компьютером", gen: "компьютера" },
    category: "object",
  },
  { id: "chimdae", ko: "침대", ru: "кровать", ruLoc: { ins: "кроватью", gen: "кровати" }, category: "object" },
  { id: "sopa", ko: "소파", ru: "диван", ruLoc: { ins: "диваном", gen: "дивана" }, category: "object" },
  { id: "takja", ko: "탁자", ru: "столик", ruLoc: { ins: "столиком", gen: "столика" }, category: "object" },
  { id: "saram", ko: "사람", ru: "человек", ruLoc: { ins: "человеком", gen: "человека" }, category: "person" },
  { id: "minsu", ko: "민수", ru: "Минсу", ruLoc: { ins: "Минсу", gen: "Минсу" }, category: "person" },
  { id: "yuna", ko: "유나", ru: "Юна", ruLoc: { ins: "Юной", gen: "Юны" }, category: "person" },
  { id: "jihun", ko: "지훈", ru: "Джихун", ruLoc: { ins: "Джихуном", gen: "Джихуна" }, category: "person" },
  { id: "sujin", ko: "수진", ru: "Суджин", ruLoc: { ins: "Суджин", gen: "Суджин" }, category: "person" },
];

export const lexemeByKo: Map<string, Lexeme> = new Map(
  lexemes.map((lexeme) => [lexeme.ko, lexeme]),
);

export function findLexeme(ko: string): Lexeme | undefined {
  return lexemeByKo.get(ko);
}

export type PositionWord = { relation: SpatialRelation; ko: string[] };

export const positionWords: PositionWord[] = [
  { relation: "front", ko: ["앞"] },
  { relation: "behind", ko: ["뒤"] },
  { relation: "beside", ko: ["옆"] },
  { relation: "left", ko: ["왼쪽"] },
  { relation: "right", ko: ["오른쪽"] },
  { relation: "above", ko: ["위"] },
  { relation: "below", ko: ["아래", "밑"] },
  { relation: "inside", ko: ["안"] },
  { relation: "outside", ko: ["밖"] },
  { relation: "between", ko: ["사이"] },
  { relation: "near", ko: ["근처"] },
];
