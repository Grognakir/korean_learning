import { describe, expect, it } from "vitest";

import { serializeNormalizedAnswer, serializeSubmissionForStorage } from "./attemptPayload";

describe("attemptPayload", () => {
  it("serializes choice submissions for storage", () => {
    const submission = {
      exerciseId: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
      type: "plain-choice" as const,
      optionId: "option-a",
    };

    expect(serializeSubmissionForStorage(submission)).toEqual(submission);
    expect(serializeNormalizedAnswer(submission)).toEqual({
      type: "plain-choice",
      optionId: "option-a",
    });
  });

  it("normalizes free-response answers", () => {
    const submission = {
      exerciseId: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
      type: "free-response" as const,
      answer: "  안녕   하세요  ",
    };

    expect(serializeNormalizedAnswer(submission)).toEqual({
      type: "free-response",
      answer: "안녕 하세요",
    });
  });
});
