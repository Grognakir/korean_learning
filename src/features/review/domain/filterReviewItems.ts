import type { LearningSkill } from "./conceptKey";
import { parseConceptKey } from "./conceptKey";
import type { ReviewQueueItem } from "./reviewPolicy";

export function filterReviewQueueItems(
  items: readonly ReviewQueueItem[],
  filters: {
    readonly skill?: LearningSkill | null;
    readonly moduleId?: string | null;
  },
): readonly ReviewQueueItem[] {
  return items.filter((item) => {
    if (filters.moduleId && item.moduleId !== filters.moduleId) {
      return false;
    }

    if (!filters.skill) {
      return true;
    }

    const parsed = parseConceptKey(item.conceptKey);
    if (parsed.kind === "skill-target") {
      return parsed.skill === filters.skill;
    }

    // Legacy exercise keys predate skill prefixes; keep them visible for safe migration.
    return true;
  });
}
