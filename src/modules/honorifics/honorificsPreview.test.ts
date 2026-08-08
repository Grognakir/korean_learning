import { describe, expect, it } from "vitest";

import {
  createTrainingSession,
  selectCurrentExercise,
  selectProgress,
  selectResultSummary,
  submitTrainingAnswer,
  trainingSessionReducer,
  type Exercise,
} from "@/features/training";
import { parseExerciseDefinition, parseLearningModuleDefinition } from "@/lib/validation";

import { composeLearningContent } from "../composeLearningContent";
import { sampleExercises, sampleModule } from "../sample";
import { honorificsPreviewExercises } from "./data/previewExercises";
import { honorificsPreviewModule } from "./domain/previewModule";

function correctSubmission(exercise: Exercise) {
  switch (exercise.type) {
    case "free-response":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answer: exercise.acceptedAnswers.find((answer) => answer.isCanonical)!.value,
      } as const;
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        optionId: exercise.correctOptionId,
      } as const;
    case "fill-blank":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answers: exercise.blanks.map((blank) => ({
          blankId: blank.id,
          answer: blank.acceptedAnswers.find((answer) => answer.isCanonical)!.value,
        })),
      } as const;
    case "matching-translation":
    case "matching-honorific":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        matches: exercise.pairs.map((pair) => ({
          leftPairId: pair.id,
          rightPairId: pair.id,
        })),
      } as const;
  }
}

describe("honorifics draft preview dataset", () => {
  it("passes Zod validation for the module and every exercise", () => {
    expect(() => parseLearningModuleDefinition(honorificsPreviewModule)).not.toThrow();

    for (const exercise of honorificsPreviewExercises) {
      expect(() => parseExerciseDefinition(exercise)).not.toThrow();
    }
  });

  it("keeps module, topic, and exercise ids unique with allowed refs", () => {
    expect(honorificsPreviewModule.slug).toBe("honorifics");
    expect(honorificsPreviewModule.level).toBe("1급");
    expect(honorificsPreviewModule.status).toBe("draft");
    expect(honorificsPreviewModule.description.ru.toLowerCase()).toContain("preview");
    expect(honorificsPreviewModule.description.ko.toLowerCase()).toContain("preview");

    const topicCodes = honorificsPreviewModule.topics.map((topic) => topic.code);
    expect(topicCodes).toEqual(expect.arrayContaining(["grandparents-age", "profession"]));
    expect(honorificsPreviewModule.topics.every((topic) => topic.status === "draft")).toBe(true);

    const topicIds = honorificsPreviewModule.topics.map((topic) => topic.id);
    expect(new Set(topicIds).size).toBe(topicIds.length);
    expect(topicIds).not.toContain(sampleModule.topics[0].id);
    expect(topicIds).not.toContain(sampleModule.topics[1].id);

    expect(honorificsPreviewModule.id).not.toBe(sampleModule.id);

    const exerciseIds = honorificsPreviewExercises.map((exercise) => exercise.id);
    const logicalIds = honorificsPreviewExercises.map((exercise) => exercise.logicalId);
    const sampleExerciseIds = new Set<string>(sampleExercises.map((exercise) => exercise.id));
    const sampleLogicalKeys = new Set<string>(
      sampleExercises.map(
        (exercise) => `${exercise.moduleSlug}:${exercise.logicalId}:${exercise.contentVersion}`,
      ),
    );

    expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
    expect(new Set(logicalIds).size).toBe(logicalIds.length);
    expect(honorificsPreviewExercises.length).toBeGreaterThanOrEqual(8);
    expect(honorificsPreviewExercises.length).toBeLessThanOrEqual(12);

    for (const exercise of honorificsPreviewExercises) {
      expect(exercise.moduleSlug).toBe("honorifics");
      expect(sampleExerciseIds.has(exercise.id)).toBe(false);
      expect(
        sampleLogicalKeys.has(
          `${exercise.moduleSlug}:${exercise.logicalId}:${exercise.contentVersion}`,
        ),
      ).toBe(false);

      for (const topicId of exercise.topicIds) {
        expect(topicIds).toContain(topicId);
      }
    }

    const coveredTopicIds = new Set(
      honorificsPreviewExercises.flatMap((exercise) => exercise.topicIds),
    );
    expect(coveredTopicIds.has(topicIds[0]!)).toBe(true);
    expect(coveredTopicIds.has(topicIds[1]!)).toBe(true);
  });

  it("runs a representative create → answer → complete session", () => {
    const exercises = honorificsPreviewExercises.slice(0, 3);
    const exerciseIds = exercises.map((exercise) => exercise.id);
    const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

    let state = createTrainingSession({
      sessionId: "honorifics-preview-integration",
      moduleSlug: "honorifics",
      mode: "practice",
      seed: 11,
      exerciseIds,
      startedAt: "2026-08-08T00:00:00.000Z",
      contentSnapshot: {
        contentVersion: "0.1.0",
        exerciseIds,
      },
    });

    expect(state.status).toBe("active");
    expect(selectProgress(state).total).toBe(3);

    for (let index = 0; index < exercises.length; index += 1) {
      const exercise = selectCurrentExercise(state, exercisesById);
      expect(exercise).toBeTruthy();

      state = submitTrainingAnswer(state, {
        exercise: exercise!,
        submission: correctSubmission(exercise!),
        submissionId: `submission-${index}`,
        occurredAt: `2026-08-08T00:00:0${index + 1}.000Z`,
      });

      state = trainingSessionReducer(state, {
        type: "next",
        occurredAt: `2026-08-08T00:00:1${index}.000Z`,
      });
    }

    expect(state.status).toBe("completed");
    expect(selectResultSummary(state).correctCount).toBe(3);
    expect(selectResultSummary(state).gradedCount).toBe(3);
  });
});

describe("learning content composition gates", () => {
  it("keeps production composition free of honorifics", () => {
    const composition = composeLearningContent("production");
    const slugs = composition.learningModuleRegistry.getAll().map((module) => module.slug);

    expect(slugs).toEqual(["sample-module"]);
    expect(composition.learningModuleRegistry.getBySlug("honorifics")).toBeUndefined();
    expect(composition.exerciseRepository.list({ moduleSlug: "honorifics" })).toHaveLength(0);
    expect(
      composition.learningModuleRegistry.getPublished().map((module) => module.slug),
    ).not.toContain("honorifics");
  });

  it("includes draft honorifics in development but hides it from published selectors", () => {
    const composition = composeLearningContent("development");
    const allSlugs = composition.learningModuleRegistry.getAll().map((module) => module.slug);
    const publishedSlugs = composition.learningModuleRegistry
      .getPublished()
      .map((module) => module.slug);

    expect(allSlugs).toEqual(expect.arrayContaining(["sample-module", "honorifics"]));
    expect(publishedSlugs).toEqual(["sample-module"]);
    expect(publishedSlugs).not.toContain("honorifics");
    expect(composition.learningModuleRegistry.getPublishedBySlug("honorifics")).toBeUndefined();
    expect(composition.exerciseRepository.list({ moduleSlug: "honorifics" })).toHaveLength(
      honorificsPreviewExercises.length,
    );

    const draftModule = composition.learningModuleRegistry.getBySlug("honorifics");
    expect(draftModule?.status).toBe("draft");
  });

  it("does not expose honorifics in production topic static params", () => {
    const composition = composeLearningContent("production");
    const topicParams = composition.learningModuleRegistry
      .getPublished()
      .map((module) => module.slug);

    expect(topicParams).not.toContain("honorifics");
  });
});
