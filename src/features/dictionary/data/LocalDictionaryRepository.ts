import {
  publishedCurriculumFixture,
  type PublishedCurriculumFixture,
} from "@/modules/curriculum/fixtures/publishedCurriculumFixture";

import type { DictionaryQuery, DictionaryRepository } from "./DictionaryRepository";
import type { PublicDictionaryEntry } from "../domain/types";

export class LocalDictionaryRepository implements DictionaryRepository {
  constructor(private readonly fixture: PublishedCurriculumFixture = publishedCurriculumFixture) {}

  async list(query: DictionaryQuery = {}): Promise<readonly PublicDictionaryEntry[]> {
    const unitByLogical = new Map(this.fixture.units.map((unit) => [unit.logicalId, unit]));
    let entries = this.fixture.dictionaryEntries.filter((entry) => entry.status === "published");

    if (query.unitSlug) {
      const unit = this.fixture.units.find((item) => item.slug === query.unitSlug);
      if (!unit) {
        return [];
      }
      entries = entries.filter((entry) => entry.unitLogicalIds.includes(unit.logicalId));
    }

    if (query.lemma) {
      entries = entries.filter((entry) => entry.lemma === query.lemma);
    }

    return entries.map((entry) => ({
      id: entry.id,
      logicalId: entry.logicalId,
      lemma: entry.lemma,
      senseKey: entry.senseKey,
      gloss: { ko: entry.glossKo, ru: entry.glossRu },
      transliteration: entry.transliteration,
      pos: entry.pos,
      level: entry.level,
      unitSlugs: entry.unitLogicalIds.map(
        (logicalId) => unitByLogical.get(logicalId)?.slug ?? logicalId,
      ),
      contentVersion: entry.contentVersion,
      language: { lemma: "ko", gloss: "ru" },
    }));
  }

  async getByLogicalId(logicalId: string): Promise<PublicDictionaryEntry | undefined> {
    const items = await this.list();
    return items.find((entry) => entry.logicalId === logicalId);
  }
}
