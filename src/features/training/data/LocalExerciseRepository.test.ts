import { describe, expect, it } from "vitest";

import { sampleExercises, sampleModule } from "@/modules/sample";
import { EXERCISE_TYPE_IDS } from "@/types";

import { ModuleRegistry } from "../domain";
import { ExerciseRepositoryError, LocalExerciseRepository } from "./LocalExerciseRepository";

function createRepository(definitions: readonly unknown[] = sampleExercises) {
  return new LocalExerciseRepository(definitions, new ModuleRegistry([sampleModule]));
}

describe("LocalExerciseRepository", () => {
  it("loads two validated exercises for every supported type", async () => {
    const repository = createRepository();
    const exercises = await repository.list();

    expect(exercises).toHaveLength(14);
    expect(new Set(exercises.map((exercise) => exercise.id))).toHaveLength(14);

    for (const type of EXERCISE_TYPE_IDS) {
      expect(await repository.list({ types: [type] })).toHaveLength(2);
    }
  });

  it("looks up exercises and filters them without exposing storage details", async () => {
    const repository = createRepository();
    const firstExercise = sampleExercises[0];

    expect((await repository.getById(firstExercise.id))?.logicalId).toBe(firstExercise.logicalId);
    expect(await repository.list({ moduleSlug: sampleModule.slug })).toHaveLength(14);
    expect(await repository.list({ topicIds: [sampleModule.topics[0].id] })).toHaveLength(4);
    expect(await repository.list({ difficulties: ["hard"] })).toHaveLength(0);
  });

  it("rejects duplicate exercise identifiers", () => {
    expect(() => createRepository([sampleExercises[0], sampleExercises[0]])).toThrowError(
      expect.objectContaining<Partial<ExerciseRepositoryError>>({
        code: "duplicate-exercise-id",
      }),
    );
  });

  it("rejects duplicate logical versions", () => {
    const duplicateVersion = {
      ...sampleExercises[0],
      id: "1905fc8d-3d90-45df-8b17-ab8c9d6110ba",
    };

    expect(() => createRepository([sampleExercises[0], duplicateVersion])).toThrowError(
      expect.objectContaining<Partial<ExerciseRepositoryError>>({
        code: "duplicate-logical-version",
      }),
    );
  });

  it("rejects unresolved module and topic references", () => {
    const unknownModule = { ...sampleExercises[0], moduleSlug: "missing-module" };
    const unknownTopic = {
      ...sampleExercises[0],
      id: "1905fc8d-3d90-45df-8b17-ab8c9d6110ba",
      topicIds: ["00000000-0000-4000-8000-000000000099"],
    };

    expect(() => createRepository([unknownModule])).toThrowError(
      expect.objectContaining<Partial<ExerciseRepositoryError>>({ code: "unknown-module" }),
    );
    expect(() => createRepository([unknownTopic])).toThrowError(
      expect.objectContaining<Partial<ExerciseRepositoryError>>({ code: "unknown-topic" }),
    );
  });
});
