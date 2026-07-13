import type { LevelMeta } from "@/lib/types";

export const levels: LevelMeta[] = [
  {
    id: "1",
    titleKo: "1급",
    titleRu: "1급 — Начальный",
    available: true,
    description: "Приветствия, быт, школа, покупки, еда, телефон, транспорт. По программе 새인하한국어1.",
  },
  {
    id: "2",
    titleKo: "2급",
    titleRu: "2급 — Элементарный",
    available: false,
    description: "Скоро: более сложные конструкции и темы повседневной жизни.",
  },
  {
    id: "3",
    titleKo: "3급",
    titleRu: "3급 — Средний−",
    available: false,
    description: "Скоро: абстрактные темы и развёрнутые высказывания.",
  },
  {
    id: "4",
    titleKo: "4급",
    titleRu: "4급 — Средний+",
    available: false,
    description: "Скоро: аргументация, новости, рабочие ситуации.",
  },
  {
    id: "5",
    titleKo: "5급",
    titleRu: "5급 — Продвинутый−",
    available: false,
    description: "Скоро: академический и профессиональный язык.",
  },
  {
    id: "6",
    titleKo: "6급",
    titleRu: "6급 — Продвинутый+",
    available: false,
    description: "Скоро: нюансы, стили речи, сложные тексты.",
  },
];

export function getLevel(id: string): LevelMeta | undefined {
  return levels.find((l) => l.id === id);
}
