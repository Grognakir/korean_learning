import { describe, expect, it } from "vitest";

import { sampleExercises, sampleModule } from "@/modules/sample";

import { mapExerciseRow } from "./exerciseMapper";

describe("exerciseMapper", () => {
  it("maps a choice exercise row into the local domain shape", () => {
    const exercise = sampleExercises.find((item) => item.logicalId === "choose-home-meaning");
    expect(exercise).toBeDefined();

    const mapped = mapExerciseRow({
      row: {
        id: exercise!.id,
        logical_id: exercise!.logicalId,
        module_id: sampleModule.id,
        primary_topic_id: exercise!.topicIds[0]!,
        type: exercise!.type,
        difficulty: exercise!.difficulty,
        prompt_ko: exercise!.prompt.ko,
        prompt_ru: exercise!.prompt.ru,
        payload: {
          correctOptionId: exercise!.correctOptionId,
          optionIds: exercise!.options.map((option) => option.id),
        },
        explanation_ru: exercise!.explanation.ru ?? "",
        status: "approved",
        content_version: exercise!.contentVersion,
        source: "manual",
        source_generation_id: null,
        created_at: "2026-08-08T00:00:00.000Z",
        updated_at: "2026-08-08T00:00:00.000Z",
      },
      moduleSlug: sampleModule.slug,
      topicRows: exercise!.topicIds.map((topicId, index) => ({
        exercise_id: exercise!.id,
        topic_id: topicId,
        role: index === 0 ? "primary" : "secondary",
      })),
      optionRows: exercise!.options.map((option, index) => ({
        id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
        exercise_id: exercise!.id,
        option_key: option.id,
        label_ko: option.label.ko,
        label_ru: option.label.ru,
        value_payload: {},
        is_correct: option.id === exercise!.correctOptionId,
        explanation_ru: null,
        sort_order: index,
      })),
      acceptedAnswerRows: [],
    });

    expect(mapped.logicalId).toBe(exercise!.logicalId);
    expect(mapped.type).toBe("meaning-choice");
    if (mapped.type === "meaning-choice") {
      expect(mapped.correctOptionId).toBe(exercise!.correctOptionId);
      expect(mapped.options.map((option) => option.id)).toEqual(
        exercise!.options.map((option) => option.id),
      );
    }
  });
});
