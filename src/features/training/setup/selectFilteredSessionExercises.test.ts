import { describe, expect, it } from "vitest";

import {
  FilteredSessionSelectionError,
  selectFilteredSessionExercises,
} from "./selectFilteredSessionExercises";
import { buildFilteredSessionId, parseFilteredSessionId } from "./filteredSessionId";

const exercises = [
  {
    id: "a",
    skill: "grammar" as const,
    unitSlug: "u01",
    difficulty: "easy" as const,
    grammarTopicLogicalId: "grammar.u01.n01",
    contentVersion: "1.0.0",
    status: "approved" as const,
  },
  {
    id: "b",
    skill: "grammar" as const,
    unitSlug: "u01",
    difficulty: "medium" as const,
    grammarTopicLogicalId: "grammar.u01.n01",
    contentVersion: "1.0.0",
    status: "approved" as const,
  },
  {
    id: "draft",
    skill: "grammar" as const,
    unitSlug: "u01",
    difficulty: "easy" as const,
    grammarTopicLogicalId: "grammar.u01.n01",
    contentVersion: "1.0.0",
    status: "draft" as const,
  },
  {
    id: "vocab",
    skill: "vocabulary" as const,
    unitSlug: "u01",
    difficulty: "easy" as const,
    grammarTopicLogicalId: null,
    contentVersion: "1.0.0",
    status: "approved" as const,
  },
];

describe("selectFilteredSessionExercises", () => {
  it("selects only approved exercises for the skill and clamps size", () => {
    const first = selectFilteredSessionExercises({
      exercises,
      request: {
        skill: "grammar",
        unitSlug: "u01",
        grammarTopicId: null,
        difficulty: null,
        sessionSize: 10,
      },
      seed: 17,
    });
    const second = selectFilteredSessionExercises({
      exercises,
      request: {
        skill: "grammar",
        unitSlug: "u01",
        grammarTopicId: null,
        difficulty: null,
        sessionSize: 10,
      },
      seed: 17,
    });

    expect(first.exerciseIds).toEqual(second.exerciseIds);
    expect(first.exerciseIds).toHaveLength(2);
    expect(first.exerciseIds.includes("draft")).toBe(false);
    expect(first.availableCount).toBe(2);
  });

  it("rejects empty approved matches without padding drafts", () => {
    expect(() =>
      selectFilteredSessionExercises({
        exercises,
        request: {
          skill: "reading",
          unitSlug: "u01",
          grammarTopicId: null,
          difficulty: null,
          sessionSize: 3,
        },
        seed: 1,
      }),
    ).toThrow(FilteredSessionSelectionError);
  });

  it("round-trips filtered session ids", () => {
    const request = {
      skill: "vocabulary" as const,
      unitSlug: "u01",
      grammarTopicId: null,
      difficulty: "easy" as const,
      sessionSize: 2,
    };
    const sessionId = buildFilteredSessionId({ request, seed: 17 });
    expect(parseFilteredSessionId(sessionId)).toEqual({ request, seed: 17 });
  });
});
