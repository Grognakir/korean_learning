import { describe, expect, it } from "vitest";

import { sampleExercises } from "@/modules/sample";
import type {
  Exercise,
  FreeResponseExercise,
  MatchingTranslationExercise,
  MeaningChoiceExercise,
} from "../exercise";
import { CheckerRegistry, CheckerRegistryError, evaluateAnswer } from "./CheckerRegistry";
import type { AnswerSubmission, FreeResponseAnswerEvaluation } from "./types";

function structuredCloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function byLogicalId(logicalId: string): Exercise {
  const exercise = sampleExercises.find((item) => item.logicalId === logicalId);
  if (!exercise) {
    throw new Error(`Missing sample exercise: ${logicalId}`);
  }

  return exercise;
}

function asFreeResponse(logicalId: string): FreeResponseExercise {
  const exercise = byLogicalId(logicalId);
  if (exercise.type !== "free-response") {
    throw new Error(`Expected free-response exercise: ${logicalId}`);
  }

  return exercise;
}

function asMeaningChoice(logicalId: string): MeaningChoiceExercise {
  const exercise = byLogicalId(logicalId);
  if (exercise.type !== "meaning-choice") {
    throw new Error(`Expected meaning-choice exercise: ${logicalId}`);
  }

  return exercise;
}

function asMatchingTranslation(logicalId: string): MatchingTranslationExercise {
  const exercise = byLogicalId(logicalId);
  if (exercise.type !== "matching-translation") {
    throw new Error(`Expected matching-translation exercise: ${logicalId}`);
  }

  return exercise;
}

function correctSubmissionFor(exercise: Exercise): AnswerSubmission {
  switch (exercise.type) {
    case "free-response":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answer: exercise.acceptedAnswers.find((answer) => answer.isCanonical)!.value,
      };
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        optionId: exercise.correctOptionId,
      };
    case "fill-blank":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answers: exercise.blanks.map((blank) => ({
          blankId: blank.id,
          answer: blank.acceptedAnswers.find((answer) => answer.isCanonical)!.value,
        })),
      };
    case "matching-translation":
    case "matching-honorific":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        matches: exercise.pairs.map((pair) => ({
          leftPairId: pair.id,
          rightPairId: pair.id,
        })),
      };
  }
}

function incorrectSubmissionFor(exercise: Exercise): AnswerSubmission {
  switch (exercise.type) {
    case "free-response":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answer: "틀림",
      };
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice": {
      const wrongOption = exercise.options.find((option) => option.id !== exercise.correctOptionId);
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        optionId: wrongOption!.id,
      };
    }
    case "fill-blank":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answers: exercise.blanks.map((blank) => ({
          blankId: blank.id,
          answer: "틀림",
        })),
      };
    case "matching-translation":
    case "matching-honorific": {
      const first = exercise.pairs[0];
      const second = exercise.pairs[1];
      if (!first || !second) {
        throw new Error("Matching exercise needs at least two pairs for incorrect fixture.");
      }

      const rest = exercise.pairs.slice(2);
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        matches: [
          { leftPairId: first.id, rightPairId: second.id },
          { leftPairId: second.id, rightPairId: first.id },
          ...rest.map((pair) => ({ leftPairId: pair.id, rightPairId: pair.id })),
        ],
      };
    }
  }
}

describe("evaluateAnswer", () => {
  it.each(
    sampleExercises.map((exercise) => [exercise.type, exercise.logicalId, exercise] as const),
  )("marks a correct %s submission for %s", (_type, _logicalId, exercise) => {
    const evaluation = evaluateAnswer(exercise, correctSubmissionFor(exercise));

    expect(evaluation.reasonCode).toBe("correct");
    expect(evaluation.isCorrect).toBe(true);
    expect(evaluation.score).toBe(exercise.scoring.points);
    expect(evaluation.scoreRatio).toBe(1);
    expect(evaluation.explanation).toEqual(exercise.explanation);
  });

  it.each(
    sampleExercises.map((exercise) => [exercise.type, exercise.logicalId, exercise] as const),
  )("marks an incorrect %s submission for %s", (_type, _logicalId, exercise) => {
    const evaluation = evaluateAnswer(exercise, incorrectSubmissionFor(exercise));

    expect(evaluation.reasonCode).toBe("incorrect");
    expect(evaluation.isCorrect).toBe(false);
    expect(evaluation.score).toBe(0);
    expect(evaluation.scoreRatio).toBe(0);
  });

  it("rejects an unknown choice option id", () => {
    const exercise = byLogicalId("choose-home-meaning");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "meaning-choice",
      optionId: "missing-option",
    });

    expect(evaluation.reasonCode).toBe("unknown-reference");
    expect(evaluation.score).toBe(0);
  });

  it("rejects an unknown fill blank id", () => {
    const exercise = byLogicalId("fill-greeting");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "fill-blank",
      answers: [{ blankId: "unknown-blank", answer: "안녕하세요" }],
    });

    expect(evaluation.reasonCode).toBe("unknown-reference");
  });

  it("rejects an unknown matching pair id", () => {
    const exercise = byLogicalId("match-home-school");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "matching-translation",
      matches: [
        { leftPairId: "home", rightPairId: "school" },
        { leftPairId: "missing", rightPairId: "home" },
      ],
    });

    expect(evaluation.reasonCode).toBe("unknown-reference");
  });

  it("rejects an empty free response", () => {
    const exercise = asFreeResponse("write-greeting");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "free-response",
      answer: "   ",
    }) as FreeResponseAnswerEvaluation;

    expect(evaluation.reasonCode).toBe("empty-answer");
    expect(evaluation.submission.answer).toBe("");
  });

  it("rejects an empty fill blank answer", () => {
    const exercise = byLogicalId("fill-greeting");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "fill-blank",
      answers: [{ blankId: "greeting", answer: "  " }],
    });

    expect(evaluation.reasonCode).toBe("empty-answer");
  });

  it("ignores matching submission order", () => {
    const exercise = byLogicalId("match-home-school");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "matching-translation",
      matches: [
        { leftPairId: "school", rightPairId: "school" },
        { leftPairId: "home", rightPairId: "home" },
      ],
    });

    expect(evaluation.reasonCode).toBe("correct");
    expect(evaluation.isCorrect).toBe(true);
  });

  it("rejects duplicate matching left references", () => {
    const exercise = byLogicalId("match-home-school");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "matching-translation",
      matches: [
        { leftPairId: "home", rightPairId: "home" },
        { leftPairId: "home", rightPairId: "school" },
      ],
    });

    expect(evaluation.reasonCode).toBe("invalid-submission");
  });

  it("rejects duplicate matching right references", () => {
    const exercise = byLogicalId("match-home-school");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "matching-translation",
      matches: [
        { leftPairId: "home", rightPairId: "home" },
        { leftPairId: "school", rightPairId: "home" },
      ],
    });

    expect(evaluation.reasonCode).toBe("invalid-submission");
  });

  it("rejects duplicate fill blank ids", () => {
    const exercise = byLogicalId("fill-greeting");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "fill-blank",
      answers: [
        { blankId: "greeting", answer: "안녕하세요" },
        { blankId: "greeting", answer: "안녕하세요" },
      ],
    });

    expect(evaluation.reasonCode).toBe("invalid-submission");
  });

  it("awards full and zero matching scores on the sample two-pair exercise", () => {
    const exercise = byLogicalId("match-home-school");

    const full = evaluateAnswer(exercise, correctSubmissionFor(exercise));
    expect(full.score).toBe(2);
    expect(full.scoreRatio).toBe(1);
    expect(full.reasonCode).toBe("correct");

    const none = evaluateAnswer(exercise, incorrectSubmissionFor(exercise));
    expect(none.score).toBe(0);
    expect(none.reasonCode).toBe("incorrect");
  });

  it("awards partial matching credit for one correct pair among three", () => {
    const exercise: MatchingTranslationExercise = {
      ...asMatchingTranslation("match-home-school"),
      pairs: [
        { id: "home", left: { ko: "집", ru: null }, right: { ko: null, ru: "дом" } },
        { id: "school", left: { ko: "학교", ru: null }, right: { ko: null, ru: "школа" } },
        { id: "friend", left: { ko: "친구", ru: null }, right: { ko: null, ru: "друг" } },
      ],
      scoring: { points: 3, partialCredit: true },
    };

    const partial = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "matching-translation",
      matches: [
        { leftPairId: "home", rightPairId: "home" },
        { leftPairId: "school", rightPairId: "friend" },
        { leftPairId: "friend", rightPairId: "school" },
      ],
    });

    expect(partial.reasonCode).toBe("partially-correct");
    expect(partial.isCorrect).toBe(false);
    expect(partial.score).toBe(1);
    expect(partial.scoreRatio).toBeCloseTo(1 / 3, 5);
  });

  it("returns zero when partialCredit is false for partially correct matching", () => {
    const exercise: MatchingTranslationExercise = {
      ...asMatchingTranslation("match-home-school"),
      pairs: [
        { id: "home", left: { ko: "집", ru: null }, right: { ko: null, ru: "дом" } },
        { id: "school", left: { ko: "학교", ru: null }, right: { ko: null, ru: "школа" } },
        { id: "friend", left: { ko: "친구", ru: null }, right: { ko: null, ru: "друг" } },
      ],
      scoring: { points: 3, partialCredit: false },
    };

    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "matching-translation",
      matches: [
        { leftPairId: "home", rightPairId: "home" },
        { leftPairId: "school", rightPairId: "friend" },
        { leftPairId: "friend", rightPairId: "school" },
      ],
    });

    expect(evaluation.reasonCode).toBe("incorrect");
    expect(evaluation.score).toBe(0);
  });

  it("returns zero when partialCredit is false for partially correct fill blanks", () => {
    const exercise: Exercise = {
      schemaVersion: 1,
      id: "7b6a3d8d-2c61-4f0a-9f2a-3fd1c8f6a111",
      logicalId: "fill-two-blanks",
      moduleSlug: "sample-module",
      topicIds: byLogicalId("fill-greeting").topicIds,
      type: "fill-blank",
      difficulty: "easy",
      prompt: { ko: null, ru: "Заполните два пропуска." },
      explanation: { ko: null, ru: "Два канонических ответа." },
      contentVersion: "1.0.0",
      scoring: { points: 2, partialCredit: false },
      template: "{{a}} {{b}}",
      templateLanguage: "ko",
      blanks: [
        {
          id: "a",
          acceptedAnswers: [{ id: "canonical", value: "안녕하세요", isCanonical: true }],
        },
        {
          id: "b",
          acceptedAnswers: [{ id: "canonical", value: "감사합니다", isCanonical: true }],
        },
      ],
    };

    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "fill-blank",
      answers: [
        { blankId: "a", answer: "안녕하세요" },
        { blankId: "b", answer: "틀림" },
      ],
    });

    expect(evaluation.reasonCode).toBe("incorrect");
    expect(evaluation.score).toBe(0);
  });

  it("awards partial fill blank credit when enabled", () => {
    const exercise: Exercise = {
      schemaVersion: 1,
      id: "8c7b4e9e-3d72-501b-903b-4ae2d9a7b222",
      logicalId: "fill-two-blanks-partial",
      moduleSlug: "sample-module",
      topicIds: byLogicalId("fill-greeting").topicIds,
      type: "fill-blank",
      difficulty: "easy",
      prompt: { ko: null, ru: "Заполните два пропуска." },
      explanation: { ko: null, ru: "Частичный балл разрешён." },
      contentVersion: "1.0.0",
      scoring: { points: 2, partialCredit: true },
      template: "{{a}} {{b}}",
      templateLanguage: "ko",
      blanks: [
        {
          id: "a",
          acceptedAnswers: [{ id: "canonical", value: "안녕하세요", isCanonical: true }],
        },
        {
          id: "b",
          acceptedAnswers: [{ id: "canonical", value: "감사합니다", isCanonical: true }],
        },
      ],
    };

    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "fill-blank",
      answers: [
        { blankId: "a", answer: "안녕하세요" },
        { blankId: "b", answer: "틀림" },
      ],
    });

    expect(evaluation.reasonCode).toBe("partially-correct");
    expect(evaluation.score).toBe(1);
    expect(evaluation.scoreRatio).toBe(0.5);
  });

  it("normalizes whitespace and NFC before free-response comparison", () => {
    const exercise = asFreeResponse("write-greeting");
    const nfcAnswer = "안녕하세요";

    const trimmed = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "free-response",
      answer: `  ${nfcAnswer}  `,
    }) as FreeResponseAnswerEvaluation;

    expect(trimmed.reasonCode).toBe("correct");
    expect(trimmed.submission.answer).toBe(nfcAnswer);

    const withInternalSpaces = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "free-response",
      answer: "안녕  하세요",
    }) as FreeResponseAnswerEvaluation;
    expect(withInternalSpaces.reasonCode).toBe("incorrect");
    expect(withInternalSpaces.submission.answer).toBe("안녕 하세요");

    const nfcEquivalent = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "free-response",
      answer: nfcAnswer.normalize("NFD"),
    });
    expect(nfcEquivalent.reasonCode).toBe("correct");
  });

  it("accepts any authored accepted answer and returns one canonical snapshot", () => {
    const exercise: FreeResponseExercise = {
      ...asFreeResponse("write-greeting"),
      acceptedAnswers: [
        { id: "canonical", value: "안녕하세요", isCanonical: true },
        { id: "alt", value: "안녕하십니까", isCanonical: false },
      ],
    };

    const alt = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "free-response",
      answer: "안녕하십니까",
    });

    expect(alt.reasonCode).toBe("correct");
    expect(alt.correctAnswer).toEqual({
      kind: "free-response",
      answer: "안녕하세요",
    });
  });

  it("rejects mismatched exerciseId", () => {
    const exercise = asMeaningChoice("choose-home-meaning");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: "00000000-0000-4000-8000-000000000000",
      type: "meaning-choice",
      optionId: exercise.correctOptionId,
    });

    expect(evaluation.reasonCode).toBe("invalid-submission");
  });

  it("rejects mismatched submission type", () => {
    const exercise = byLogicalId("choose-home-meaning");
    const evaluation = evaluateAnswer(exercise, {
      exerciseId: exercise.id,
      type: "free-response",
      answer: "дом",
    });

    expect(evaluation.reasonCode).toBe("invalid-submission");
    expect(evaluation.type).toBe("meaning-choice");
  });

  it("throws when the exercise type has no registered checker", () => {
    const unsupported = {
      ...byLogicalId("write-greeting"),
      type: "unsupported-type",
    } as unknown as Exercise;

    expect(() =>
      CheckerRegistry.evaluate(unsupported, {
        exerciseId: unsupported.id,
        type: "free-response",
        answer: "안녕하세요",
      }),
    ).toThrowError(
      expect.objectContaining<Partial<CheckerRegistryError>>({
        code: "unsupported-exercise-type",
      }),
    );
  });

  it("does not mutate the exercise or submission", () => {
    const exercise = byLogicalId("match-home-school");
    const submission: AnswerSubmission = {
      exerciseId: exercise.id,
      type: "matching-translation",
      matches: [
        { leftPairId: "school", rightPairId: "school" },
        { leftPairId: "home", rightPairId: "home" },
      ],
    };
    const exerciseSnapshot = structuredCloneValue(exercise);
    const submissionSnapshot = structuredCloneValue(submission);

    evaluateAnswer(exercise, submission);

    expect(exercise).toEqual(exerciseSnapshot);
    expect(submission).toEqual(submissionSnapshot);
  });
});
