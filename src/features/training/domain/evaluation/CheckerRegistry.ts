import type { Exercise } from "../exercise";
import { checkChoiceAnswer } from "./checkers/choiceChecker";
import { checkFillBlankAnswer } from "./checkers/fillBlankChecker";
import { checkFreeResponseAnswer } from "./checkers/freeResponseChecker";
import { checkMatchingAnswer } from "./checkers/matchingChecker";
import type {
  AnswerEvaluation,
  AnswerSubmission,
  ChoiceAnswerSubmission,
  FillBlankAnswerSubmission,
  FreeResponseAnswerSubmission,
  MatchingAnswerSubmission,
} from "./types";

export class CheckerRegistryError extends Error {
  readonly code: "unsupported-exercise-type";

  constructor(message: string) {
    super(message);
    this.name = "CheckerRegistryError";
    this.code = "unsupported-exercise-type";
  }
}

function createInvalidTypeMismatchEvaluation(
  exercise: Exercise,
  submission: AnswerSubmission,
): AnswerEvaluation {
  const maxScore = exercise.scoring.points;
  const explanation = exercise.explanation;

  switch (exercise.type) {
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
    case "single-choice":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        isCorrect: false,
        score: 0,
        maxScore,
        scoreRatio: 0,
        reasonCode: "invalid-submission",
        submission: {
          exerciseId: submission.exerciseId,
          type: exercise.type,
          optionId: "optionId" in submission ? submission.optionId : "",
        },
        correctAnswer: {
          kind: "choice",
          optionId: exercise.correctOptionId,
        },
        explanation,
      };
    case "free-response":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        isCorrect: false,
        score: 0,
        maxScore,
        scoreRatio: 0,
        reasonCode: "invalid-submission",
        submission: {
          exerciseId: submission.exerciseId,
          type: exercise.type,
          answer: "answer" in submission ? String(submission.answer) : "",
        },
        correctAnswer: {
          kind: "free-response",
          answer: exercise.acceptedAnswers.find((answer) => answer.isCanonical)?.value ?? "",
        },
        explanation,
      };
    case "fill-blank":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        isCorrect: false,
        score: 0,
        maxScore,
        scoreRatio: 0,
        reasonCode: "invalid-submission",
        submission: {
          exerciseId: submission.exerciseId,
          type: exercise.type,
          answers: "answers" in submission ? submission.answers : [],
        },
        correctAnswer: {
          kind: "fill-blank",
          answers: exercise.blanks.map((blank) => ({
            blankId: blank.id,
            answer: blank.acceptedAnswers.find((answer) => answer.isCanonical)?.value ?? "",
          })),
        },
        explanation,
        itemResults: [],
      };
    case "matching-translation":
    case "matching-honorific":
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        isCorrect: false,
        score: 0,
        maxScore,
        scoreRatio: 0,
        reasonCode: "invalid-submission",
        submission: {
          exerciseId: submission.exerciseId,
          type: exercise.type,
          matches: "matches" in submission ? submission.matches : [],
        },
        correctAnswer: {
          kind: "matching",
          matches: exercise.pairs.map((pair) => ({
            leftPairId: pair.id,
            rightPairId: pair.id,
          })),
        },
        explanation,
        itemResults: [],
      };
    default: {
      const exhaustiveCheck: never = exercise;
      throw new CheckerRegistryError(
        `No checker registered for exercise type "${(exhaustiveCheck as Exercise).type}".`,
      );
    }
  }
}

export function evaluateAnswer(exercise: Exercise, submission: AnswerSubmission): AnswerEvaluation {
  if (submission.type !== exercise.type) {
    return createInvalidTypeMismatchEvaluation(exercise, submission);
  }

  switch (exercise.type) {
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
    case "single-choice":
      return checkChoiceAnswer(exercise, submission as ChoiceAnswerSubmission);
    case "free-response":
      return checkFreeResponseAnswer(exercise, submission as FreeResponseAnswerSubmission);
    case "fill-blank":
      return checkFillBlankAnswer(exercise, submission as FillBlankAnswerSubmission);
    case "matching-translation":
    case "matching-honorific":
      return checkMatchingAnswer(exercise, submission as MatchingAnswerSubmission);
    default: {
      const exhaustiveCheck: never = exercise;
      throw new CheckerRegistryError(
        `No checker registered for exercise type "${(exhaustiveCheck as Exercise).type}".`,
      );
    }
  }
}

export const CheckerRegistry = {
  evaluate: evaluateAnswer,
} as const;
