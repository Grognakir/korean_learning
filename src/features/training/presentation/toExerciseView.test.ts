import { describe, expect, it } from "vitest";

import { sampleExercises } from "@/modules/sample";

import {
  describeFillBlankTemplate,
  parseFillBlankTemplate,
  toExerciseView,
} from "./toExerciseView";

function byLogicalId(logicalId: string) {
  const exercise = sampleExercises.find((item) => item.logicalId === logicalId);
  if (!exercise) {
    throw new Error(`Missing sample exercise: ${logicalId}`);
  }

  return exercise;
}

describe("toExerciseView", () => {
  it("omits answer keys from choice and free-response views", () => {
    const choiceView = toExerciseView(byLogicalId("choose-home-meaning"));
    const freeView = toExerciseView(byLogicalId("write-greeting"));

    expect(choiceView).toMatchObject({
      type: "meaning-choice",
      options: [{ id: "home" }, { id: "school" }],
    });
    expect(choiceView).not.toHaveProperty("correctOptionId");
    expect(freeView).toMatchObject({
      type: "free-response",
      answerLanguage: "ko",
    });
    expect(freeView).not.toHaveProperty("acceptedAnswers");
  });

  it("parses fill-blank templates into a readable sequence", () => {
    const segments = parseFillBlankTemplate("{{greeting}}!");
    expect(segments).toEqual([
      { kind: "blank", blankId: "greeting" },
      { kind: "text", value: "!" },
    ]);
    expect(describeFillBlankTemplate(segments)).toBe("«greeting»!");

    const view = toExerciseView(byLogicalId("fill-greeting"));
    expect(view).toMatchObject({
      type: "fill-blank",
      blankIds: ["greeting"],
    });
    expect(view).not.toHaveProperty("blanks");
  });

  it("builds matching views with selectable right options", () => {
    const view = toExerciseView(byLogicalId("match-home-school"), { seed: 17 });
    expect(view.type).toBe("matching-translation");
    if (view.type !== "matching-translation") {
      return;
    }

    expect(view.leftItems).toHaveLength(2);
    expect(view.rightOptions).toHaveLength(2);
    expect(view.rightOptions.map((item) => item.pairId).sort()).toEqual(["home", "school"]);
  });
});
