import { describe, expect, it } from "vitest";

import { assertPublicCurriculumShape } from "./assertPublicCatalogShape";
import { LocalCatalogRepository } from "./LocalCatalogRepository";
import { draftCurriculumUnitFixture } from "@/modules/curriculum/fixtures/publishedCurriculumFixture";

describe("LocalCatalogRepository", () => {
  const repository = new LocalCatalogRepository();

  it("lists only published units with aggregate counts and safe public shape", async () => {
    const result = await repository.listUnits();
    expect(result.status).toBe("ready");
    if (result.status !== "ready") {
      return;
    }

    expect(result.items).toHaveLength(2);
    expect(result.items.map((unit) => unit.slug)).toEqual(["u01", "u02"]);
    expect(result.items[0]?.counts.grammarTopics).toBe(1);
    assertPublicCurriculumShape(result.items, "public units");
  });

  it("excludes draft unit slugs and returns not_found for unknown filters", async () => {
    await expect(
      repository.getUnitBySlug(draftCurriculumUnitFixture.slug),
    ).resolves.toBeUndefined();
    await expect(repository.listGrammarTopics({ unitSlug: "missing-unit" })).resolves.toEqual({
      status: "not_found",
    });
    await expect(
      repository.listGrammarTopics({ grammarTopicId: "does-not-exist" }),
    ).resolves.toEqual({ status: "not_found" });
  });

  it("aggregates catalog counts in one call without N+1 module loops in the contract", async () => {
    const counts = await repository.aggregateCounts();
    expect(counts).toEqual({
      units: 2,
      grammarTopics: 2,
      dictionaryEntries: 2,
      readingPassages: 1,
      approvedExercises: 2,
    });
  });
});
