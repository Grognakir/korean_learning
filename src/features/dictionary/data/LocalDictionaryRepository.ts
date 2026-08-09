import {
  publishedCurriculumFixture,
  type PublishedCurriculumFixture,
} from "@/modules/curriculum/fixtures/publishedCurriculumFixture";

import type {
  DictionaryPageResult,
  DictionaryQuery,
  DictionaryRepository,
} from "./DictionaryRepository";
import type { PublicDictionaryEntry } from "../domain/types";

const DEFAULT_PAGE_SIZE = 20;

function toPublic(
  entry: PublishedCurriculumFixture["dictionaryEntries"][number],
  unitByLogical: Map<string, PublishedCurriculumFixture["units"][number]>,
): PublicDictionaryEntry {
  return {
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
  };
}

export class LocalDictionaryRepository implements DictionaryRepository {
  constructor(private readonly fixture: PublishedCurriculumFixture = publishedCurriculumFixture) {}

  async list(query: DictionaryQuery = {}): Promise<readonly PublicDictionaryEntry[]> {
    const page = await this.listPage({ ...query, page: 1, pageSize: Number.MAX_SAFE_INTEGER });
    return page.items;
  }

  async listPage(query: DictionaryQuery = {}): Promise<DictionaryPageResult> {
    const unitByLogical = new Map(this.fixture.units.map((unit) => [unit.logicalId, unit]));
    let entries = this.fixture.dictionaryEntries.filter((entry) => entry.status === "published");

    if (query.unitSlug) {
      const unit = this.fixture.units.find((item) => item.slug === query.unitSlug);
      if (!unit) {
        return {
          items: [],
          total: 0,
          page: 1,
          pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
          posOptions: [],
          homonymLemmas: [],
        };
      }
      entries = entries.filter((entry) => entry.unitLogicalIds.includes(unit.logicalId));
    }

    if (query.lemma) {
      entries = entries.filter((entry) => entry.lemma === query.lemma);
    }

    const posOptions = [
      ...new Set(
        entries.map((entry) => entry.pos).filter((value): value is string => Boolean(value)),
      ),
    ].sort((left, right) => left.localeCompare(right));

    if (query.pos) {
      entries = entries.filter((entry) => entry.pos === query.pos);
    }

    const mapped = entries
      .map((entry) => toPublic(entry, unitByLogical))
      .sort((left, right) => {
        const byLemma = left.lemma.localeCompare(right.lemma, "ko");
        return byLemma !== 0 ? byLemma : left.senseKey.localeCompare(right.senseKey);
      });

    const lemmaCounts = new Map<string, number>();
    for (const entry of mapped) {
      lemmaCounts.set(entry.lemma, (lemmaCounts.get(entry.lemma) ?? 0) + 1);
    }
    const homonymLemmas = [...lemmaCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([lemma]) => lemma);

    const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
    const total = mapped.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
    const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
    const start = (page - 1) * pageSize;

    return {
      items: mapped.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      posOptions,
      homonymLemmas,
    };
  }

  async getByLogicalId(logicalId: string): Promise<PublicDictionaryEntry | undefined> {
    const items = await this.list();
    return items.find((entry) => entry.logicalId === logicalId);
  }
}
