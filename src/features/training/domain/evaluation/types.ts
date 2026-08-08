import type { ExerciseText } from "../exercise";
import type { ExerciseTypeId } from "@/types";

export const ANSWER_REASON_CODES = [
  "correct",
  "incorrect",
  "partially-correct",
  "empty-answer",
  "invalid-submission",
  "unknown-reference",
] as const;

export type AnswerReasonCode = (typeof ANSWER_REASON_CODES)[number];

type SubmissionBase<Type extends ExerciseTypeId> = {
  readonly exerciseId: string;
  readonly type: Type;
};

export type ChoiceAnswerSubmission = SubmissionBase<
  "meaning-choice" | "honorific-choice" | "plain-choice"
> & {
  readonly optionId: string;
};

export type FreeResponseAnswerSubmission = SubmissionBase<"free-response"> & {
  readonly answer: string;
};

export type FillBlankAnswerItem = {
  readonly blankId: string;
  readonly answer: string;
};

export type FillBlankAnswerSubmission = SubmissionBase<"fill-blank"> & {
  readonly answers: readonly FillBlankAnswerItem[];
};

export type MatchingAnswerItem = {
  readonly leftPairId: string;
  readonly rightPairId: string;
};

export type MatchingAnswerSubmission = SubmissionBase<
  "matching-translation" | "matching-honorific"
> & {
  readonly matches: readonly MatchingAnswerItem[];
};

export type AnswerSubmission =
  | ChoiceAnswerSubmission
  | FreeResponseAnswerSubmission
  | FillBlankAnswerSubmission
  | MatchingAnswerSubmission;

export type FillBlankItemResult = {
  readonly blankId: string;
  readonly isCorrect: boolean;
  readonly submittedAnswer: string;
  readonly canonicalAnswer: string;
};

export type MatchingItemResult = {
  readonly leftPairId: string;
  readonly rightPairId: string;
  readonly isCorrect: boolean;
  readonly correctRightPairId: string;
};

export type ChoiceCorrectAnswer = {
  readonly kind: "choice";
  readonly optionId: string;
};

export type FreeResponseCorrectAnswer = {
  readonly kind: "free-response";
  readonly answer: string;
};

export type FillBlankCorrectAnswer = {
  readonly kind: "fill-blank";
  readonly answers: readonly {
    readonly blankId: string;
    readonly answer: string;
  }[];
};

export type MatchingCorrectAnswer = {
  readonly kind: "matching";
  readonly matches: readonly {
    readonly leftPairId: string;
    readonly rightPairId: string;
  }[];
};

export type CorrectAnswerSnapshot =
  ChoiceCorrectAnswer | FreeResponseCorrectAnswer | FillBlankCorrectAnswer | MatchingCorrectAnswer;

type EvaluationBase<Type extends ExerciseTypeId, Submission extends AnswerSubmission> = {
  readonly exerciseId: string;
  readonly type: Type;
  readonly isCorrect: boolean;
  readonly score: number;
  readonly maxScore: number;
  readonly scoreRatio: number;
  readonly reasonCode: AnswerReasonCode;
  readonly submission: Submission;
  readonly correctAnswer: CorrectAnswerSnapshot;
  readonly explanation: ExerciseText;
};

export type ChoiceAnswerEvaluation = EvaluationBase<
  "meaning-choice" | "honorific-choice" | "plain-choice",
  ChoiceAnswerSubmission
>;

export type FreeResponseAnswerEvaluation = EvaluationBase<
  "free-response",
  FreeResponseAnswerSubmission
>;

export type FillBlankAnswerEvaluation = EvaluationBase<"fill-blank", FillBlankAnswerSubmission> & {
  readonly itemResults: readonly FillBlankItemResult[];
};

export type MatchingAnswerEvaluation = EvaluationBase<
  "matching-translation" | "matching-honorific",
  MatchingAnswerSubmission
> & {
  readonly itemResults: readonly MatchingItemResult[];
};

export type AnswerEvaluation =
  | ChoiceAnswerEvaluation
  | FreeResponseAnswerEvaluation
  | FillBlankAnswerEvaluation
  | MatchingAnswerEvaluation;
