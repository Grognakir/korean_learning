export type LevelId = "1" | "2" | "3" | "4" | "5" | "6";

export type LevelMeta = {
  id: LevelId;
  titleKo: string;
  titleRu: string;
  available: boolean;
  description: string;
};

export type TopicMeta = {
  slug: string;
  titleKo: string;
  titleRu: string;
  description: string;
  available: boolean;
};
