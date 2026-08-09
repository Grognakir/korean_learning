export const MASTERY_STATUSES = ["not_started", "learning", "practiced"] as const;

export type MasteryStatus = (typeof MASTERY_STATUSES)[number];

export const PRACTICED_MIN_ATTEMPTS = 3 as const;
export const PRACTICED_MIN_ACCURACY = 0.8 as const;

export function computeTopicMasteryStatus(
  attemptsCount: number,
  correctCount: number,
): MasteryStatus {
  if (attemptsCount <= 0) {
    return "not_started";
  }

  const accuracy = correctCount / attemptsCount;
  if (attemptsCount >= PRACTICED_MIN_ATTEMPTS && accuracy >= PRACTICED_MIN_ACCURACY) {
    return "practiced";
  }

  return "learning";
}

export function computeModuleMasteryStatus(input: {
  readonly moduleAttemptsCount: number;
  readonly publishedTopicCount: number;
  readonly practicedTopicCount: number;
}): MasteryStatus {
  if (input.moduleAttemptsCount <= 0) {
    return "not_started";
  }

  if (input.publishedTopicCount > 0 && input.practicedTopicCount === input.publishedTopicCount) {
    return "practiced";
  }

  return "learning";
}

export function computeAccuracy(correctCount: number, attemptsCount: number): number {
  if (attemptsCount <= 0) {
    return 0;
  }

  return correctCount / attemptsCount;
}

/** Rounds for display only; stored values stay full precision. */
export function formatAccuracyPercent(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

export function masteryStatusLabel(status: MasteryStatus): string {
  switch (status) {
    case "not_started":
      return "Не начато";
    case "learning":
      return "Изучается";
    case "practiced":
      return "Практиковано";
  }
}

export type LearningSkillId = "grammar" | "vocabulary" | "reading";

export const LEARNING_SKILLS = ["grammar", "vocabulary", "reading"] as const;

export type TopicProgressSnapshot = {
  readonly topicId: string;
  readonly code: string;
  readonly titleRu: string;
  readonly attemptsCount: number;
  readonly correctCount: number;
  readonly accuracy: number;
  readonly masteryStatus: MasteryStatus;
  readonly lastPracticedAt: string | null;
};

export type SkillProgressSnapshot = {
  readonly skill: LearningSkillId;
  readonly attemptsCount: number;
  readonly correctCount: number;
  readonly accuracy: number;
  readonly masteryStatus: MasteryStatus;
  readonly lastPracticedAt: string | null;
};

export type ModuleProgressSnapshot = {
  readonly moduleId: string;
  readonly moduleSlug: string;
  readonly titleRu: string;
  readonly titleKo: string;
  readonly level: string;
  readonly attemptsCount: number;
  readonly correctCount: number;
  readonly accuracy: number;
  readonly completedSessions: number;
  readonly masteryStatus: MasteryStatus;
  readonly lastPracticedAt: string | null;
  readonly skills: readonly SkillProgressSnapshot[];
  readonly topics: readonly TopicProgressSnapshot[];
};

export type LearningProgressOverview = {
  readonly modules: readonly ModuleProgressSnapshot[];
};

export function learningSkillLabel(skill: LearningSkillId): string {
  switch (skill) {
    case "grammar":
      return "Грамматика";
    case "vocabulary":
      return "Словарь";
    case "reading":
      return "Чтение";
  }
}

export function hasAnyRecordedProgress(overview: LearningProgressOverview): boolean {
  return overview.modules.some(
    (module) =>
      module.attemptsCount > 0 ||
      module.topics.some((topic) => topic.attemptsCount > 0) ||
      module.skills.some((skill) => skill.attemptsCount > 0),
  );
}
