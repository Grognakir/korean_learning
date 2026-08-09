import type { PublicGrammarTopicSummary } from "../domain/types";

export type GrammarTopicCategoryGroup = {
  readonly category: string;
  readonly topics: readonly PublicGrammarTopicSummary[];
};

export type GrammarTopicUnitGroup = {
  readonly unitNumber: number;
  readonly unitSlug: string;
  readonly unitTitleRu: string | null;
  readonly categories: readonly GrammarTopicCategoryGroup[];
};

export function groupGrammarTopics(
  topics: readonly PublicGrammarTopicSummary[],
  unitTitles: ReadonlyMap<string, string> = new Map(),
): readonly GrammarTopicUnitGroup[] {
  const byUnit = new Map<string, PublicGrammarTopicSummary[]>();

  for (const topic of topics) {
    const key = topic.unitSlug;
    const bucket = byUnit.get(key);
    if (bucket) {
      bucket.push(topic);
    } else {
      byUnit.set(key, [topic]);
    }
  }

  return [...byUnit.entries()]
    .map(([unitSlug, unitTopics]) => {
      const unitNumber = unitTopics[0]!.unitNumber;
      const byCategory = new Map<string, PublicGrammarTopicSummary[]>();

      for (const topic of unitTopics) {
        const bucket = byCategory.get(topic.category);
        if (bucket) {
          bucket.push(topic);
        } else {
          byCategory.set(topic.category, [topic]);
        }
      }

      const categories = [...byCategory.entries()]
        .map(([category, categoryTopics]) => ({
          category,
          topics: [...categoryTopics].sort((left, right) =>
            left.logicalId.localeCompare(right.logicalId),
          ),
        }))
        .sort((left, right) => left.category.localeCompare(right.category));

      return {
        unitNumber,
        unitSlug,
        unitTitleRu: unitTitles.get(unitSlug) ?? null,
        categories,
      };
    })
    .sort((left, right) => left.unitNumber - right.unitNumber);
}
