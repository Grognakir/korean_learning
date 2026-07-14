import type { LevelId, LevelMeta, TopicMeta } from "@/lib/types";

export const levels: LevelMeta[] = [
  {
    id: "1",
    titleKo: "1급",
    titleRu: "1급 — Начальный",
    available: true,
    description: "Начальный уровень.",
  },
  {
    id: "2",
    titleKo: "2급",
    titleRu: "2급 — Элементарный",
    available: false,
    description: "Элементарный уровень.",
  },
  {
    id: "3",
    titleKo: "3급",
    titleRu: "3급 — Средний−",
    available: false,
    description: "Средний уровень (−).",
  },
  {
    id: "4",
    titleKo: "4급",
    titleRu: "4급 — Средний+",
    available: false,
    description: "Средний уровень (+).",
  },
  {
    id: "5",
    titleKo: "5급",
    titleRu: "5급 — Продвинутый−",
    available: false,
    description: "Продвинутый уровень (−).",
  },
  {
    id: "6",
    titleKo: "6급",
    titleRu: "6급 — Продвинутый+",
    available: false,
    description: "Продвинутый уровень (+).",
  },
];

export const topicsByLevel: Record<LevelId, TopicMeta[]> = {
  "1": [
    {
      slug: "location",
      titleKo: "위치",
      titleRu: "Расположение в пространстве",
      description: "Где находится предмет, здание или человек: 앞, 뒤, 옆, 위, 아래 и другие отношения.",
      available: true,
    },
  ],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": [],
};

export function isLevelId(value: string): value is LevelId {
  return levels.some((level) => level.id === value);
}
