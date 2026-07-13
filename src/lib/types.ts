export type LevelId = "1" | "2" | "3" | "4" | "5" | "6";

export type LevelMeta = {
  id: LevelId;
  titleKo: string;
  titleRu: string;
  available: boolean;
  description: string;
};

export type Subtopic = {
  id: string;
  titleKo: string;
  titleRu: string;
  grammarIds: string[];
};

export type Topic = {
  id: string;
  unit: number;
  titleKo: string;
  titleRu: string;
  subtopics: Subtopic[];
  vocabDomainIds: string[];
};

export type GrammarPoint = {
  id: string;
  form: string;
  titleRu: string;
  topicId: string;
  explanation: string;
  examples: { ko: string; ru: string }[];
};

export type VocabItem = {
  id: string;
  ko: string;
  ru: string;
  romanization?: string;
  examples: { ko: string; ru: string }[];
};

export type VocabDomain = {
  id: string;
  titleKo: string;
  titleRu: string;
  topicIds: string[];
  words: VocabItem[];
};

export type ClozeExercise = {
  id: string;
  sentenceKo: string;
  answer: string;
  options: string[];
  translationRu: string;
  relatedGrammarId?: string;
  relatedVocabIds?: string[];
  topicId?: string;
  domainId?: string;
};

export type ChoiceExercise = {
  id: string;
  promptRu: string;
  promptKo?: string;
  options: string[];
  answer: string;
  explanation?: string;
  relatedGrammarId?: string;
  topicId?: string;
};

export type Exercise = ClozeExercise | (ChoiceExercise & { kind: "choice" });

export type SrsRating = "again" | "hard" | "good" | "easy";

export type SrsCardState = {
  ease: number;
  interval: number;
  repetitions: number;
  dueAt: number;
  lastRating?: SrsRating;
};

export type ProgressState = {
  srs: Record<string, SrsCardState>;
  studiedGrammar: string[];
  studiedTopics: string[];
  studiedDomains: string[];
};
