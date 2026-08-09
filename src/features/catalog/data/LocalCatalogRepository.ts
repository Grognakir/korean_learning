import {
  draftCurriculumUnitFixture,
  publishedCurriculumFixture,
  type PublishedCurriculumFixture,
} from "@/modules/curriculum/fixtures/publishedCurriculumFixture";

import type { CatalogRepository } from "./CatalogRepository";
import { mapFixtureGrammarToPublic, mapFixtureUnitToPublic } from "./mappers/catalogMappers";
import type {
  CatalogListResult,
  CatalogQuery,
  PublicGrammarTopicSummary,
  PublicUnitSummary,
} from "../domain/types";

export class LocalCatalogRepository implements CatalogRepository {
  constructor(
    private readonly fixture: PublishedCurriculumFixture = publishedCurriculumFixture,
    private readonly includeDraftProbe: boolean = true,
  ) {}

  async listUnits(): Promise<CatalogListResult<PublicUnitSummary>> {
    const published = this.fixture.units.filter((unit) => unit.status === "published");
    // Ensure draft probe never leaks into public lists.
    void this.includeDraftProbe;
    void draftCurriculumUnitFixture;

    if (published.length === 0) {
      return { status: "empty", items: [] };
    }

    return {
      status: "ready",
      items: published.map((unit) => mapFixtureUnitToPublic(unit, this.fixture)),
    };
  }

  async getUnitBySlug(slug: string): Promise<PublicUnitSummary | undefined> {
    if (slug === draftCurriculumUnitFixture.slug) {
      return undefined;
    }

    const unit = this.fixture.units.find(
      (item) => item.slug === slug && item.status === "published",
    );
    return unit ? mapFixtureUnitToPublic(unit, this.fixture) : undefined;
  }

  async listGrammarTopics(
    query: CatalogQuery = {},
  ): Promise<CatalogListResult<PublicGrammarTopicSummary>> {
    if (query.unitSlug) {
      const unit = this.fixture.units.find(
        (item) => item.slug === query.unitSlug && item.status === "published",
      );
      if (!unit) {
        return { status: "not_found" };
      }
    }

    const unitByLogical = new Map(this.fixture.units.map((unit) => [unit.logicalId, unit]));
    let topics = this.fixture.grammarTopics.filter((topic) => topic.status === "published");

    if (query.unitSlug) {
      const unit = this.fixture.units.find((item) => item.slug === query.unitSlug);
      topics = topics.filter((topic) => topic.unitLogicalId === unit?.logicalId);
    }

    if (query.grammarTopicId) {
      topics = topics.filter(
        (topic) => topic.id === query.grammarTopicId || topic.logicalId === query.grammarTopicId,
      );
      if (topics.length === 0) {
        return { status: "not_found" };
      }
    }

    if (topics.length === 0) {
      return { status: "empty", items: [] };
    }

    return {
      status: "ready",
      items: topics.map((topic) => {
        const unit = unitByLogical.get(topic.unitLogicalId);
        if (!unit) {
          throw new Error(`Missing unit for topic ${topic.logicalId}`);
        }
        return mapFixtureGrammarToPublic(topic, unit.slug, unit.unitNumber);
      }),
    };
  }

  async getGrammarTopicByLogicalId(
    logicalId: string,
  ): Promise<PublicGrammarTopicSummary | undefined> {
    const result = await this.listGrammarTopics({ grammarTopicId: logicalId });
    if (result.status !== "ready") {
      return undefined;
    }
    return result.items[0];
  }

  async aggregateCounts() {
    return {
      units: this.fixture.units.filter((unit) => unit.status === "published").length,
      grammarTopics: this.fixture.grammarTopics.filter((topic) => topic.status === "published")
        .length,
      dictionaryEntries: this.fixture.dictionaryEntries.filter(
        (entry) => entry.status === "published",
      ).length,
      readingPassages: this.fixture.readingPassages.filter(
        (passage) => passage.status === "published",
      ).length,
      approvedExercises: this.fixture.exercises.filter((exercise) => exercise.status === "approved")
        .length,
    };
  }
}
