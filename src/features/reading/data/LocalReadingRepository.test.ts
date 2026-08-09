import { describe, expect, it } from "vitest";

import { assertPublicCurriculumShape } from "@/features/catalog/data/assertPublicCatalogShape";

import { LocalReadingRepository } from "./LocalReadingRepository";

describe("LocalReadingRepository", () => {
  const repository = new LocalReadingRepository();

  it("returns approved exercises without correct-answer fields", async () => {
    const exercises = await repository.listApprovedExercises({ learningSkill: "reading" });
    expect(exercises).toHaveLength(1);
    assertPublicCurriculumShape(exercises, "public curriculum exercises");
    expect(exercises[0]?.options[0]).toHaveProperty("id");
    expect(JSON.stringify(exercises)).not.toContain("correctOptionId");
  });

  it("filters by difficulty and unknown unit slug returns empty", async () => {
    await expect(
      repository.listApprovedExercises({ unitSlug: "nope", difficulty: "easy" }),
    ).resolves.toEqual([]);
    await expect(repository.listApprovedExercises({ difficulty: "easy" })).resolves.toHaveLength(1);
  });
});
