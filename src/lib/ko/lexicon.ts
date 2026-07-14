import type { SpatialRelation } from "@/lib/scene/types";

export type LexemeCategory = "person" | "building" | "object" | "room" | "place";

export type Lexeme = {
  id: string;
  ko: string;
  ru: string;
  category: LexemeCategory;
};

export const lexemes: Lexeme[] = [
  { id: "hakgyo", ko: "학교", ru: "школа", category: "building" },
  { id: "byeongwon", ko: "병원", ru: "больница", category: "building" },
  { id: "eunhaeng", ko: "은행", ru: "банк", category: "building" },
  { id: "yakguk", ko: "약국", ru: "аптека", category: "building" },
  { id: "seojeom", ko: "서점", ru: "книжный магазин", category: "building" },
  { id: "pyeonuijeom", ko: "편의점", ru: "минимаркет", category: "building" },
  { id: "sikdang", ko: "식당", ru: "столовая", category: "building" },
  { id: "kape", ko: "카페", ru: "кафе", category: "building" },
  { id: "jip", ko: "집", ru: "дом", category: "building" },
  { id: "namu", ko: "나무", ru: "дерево", category: "place" },
  { id: "gyosil", ko: "교실", ru: "класс", category: "room" },
  { id: "hwajangsil", ko: "화장실", ru: "туалет", category: "room" },
  { id: "samusil", ko: "사무실", ru: "офис", category: "room" },
  { id: "doseogwan", ko: "도서관", ru: "библиотека", category: "room" },
  { id: "chaeksang", ko: "책상", ru: "парта", category: "object" },
  { id: "uija", ko: "의자", ru: "стул", category: "object" },
  { id: "chilpan", ko: "칠판", ru: "доска", category: "object" },
  { id: "changmun", ko: "창문", ru: "окно", category: "object" },
  { id: "mun", ko: "문", ru: "дверь", category: "object" },
  { id: "sigye", ko: "시계", ru: "часы", category: "object" },
  { id: "gabang", ko: "가방", ru: "сумка", category: "object" },
  { id: "chaek", ko: "책", ru: "книга", category: "object" },
  { id: "keompyuteo", ko: "컴퓨터", ru: "компьютер", category: "object" },
  { id: "chimdae", ko: "침대", ru: "кровать", category: "object" },
  { id: "sopa", ko: "소파", ru: "диван", category: "object" },
  { id: "takja", ko: "탁자", ru: "столик", category: "object" },
  { id: "saram", ko: "사람", ru: "человек", category: "person" },
  { id: "minsu", ko: "민수", ru: "Минсу", category: "person" },
  { id: "yuna", ko: "유나", ru: "Юна", category: "person" },
  { id: "jihun", ko: "지훈", ru: "Джихун", category: "person" },
  { id: "sujin", ko: "수진", ru: "Суджин", category: "person" },
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
