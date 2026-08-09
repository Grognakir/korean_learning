import type { PublicDictionaryEntry } from "../domain/types";

export function withHomonymLabels(
  items: readonly PublicDictionaryEntry[],
  homonymLemmas: ReadonlySet<string> | readonly string[] = [],
): ReadonlyArray<PublicDictionaryEntry & { readonly showSenseLabel: boolean }> {
  const set = homonymLemmas instanceof Set ? homonymLemmas : new Set(homonymLemmas);

  if (set.size === 0) {
    const lemmaCounts = new Map<string, number>();
    for (const entry of items) {
      lemmaCounts.set(entry.lemma, (lemmaCounts.get(entry.lemma) ?? 0) + 1);
    }
    return items.map((entry) => ({
      ...entry,
      showSenseLabel: (lemmaCounts.get(entry.lemma) ?? 0) > 1,
    }));
  }

  return items.map((entry) => ({
    ...entry,
    showSenseLabel: set.has(entry.lemma),
  }));
}
