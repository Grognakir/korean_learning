import type { SupportedLanguage } from "@/types";

import type { Exercise, ExerciseText } from "../domain";
import { seededShuffle } from "../domain";

export type ExerciseTextView = {
  readonly ko: string | null;
  readonly ru: string | null;
};

export type ChoiceOptionView = {
  readonly id: string;
  readonly label: ExerciseTextView;
};

export type MatchingLeftItemView = {
  readonly pairId: string;
  readonly label: ExerciseTextView;
};

export type MatchingRightOptionView = {
  readonly pairId: string;
  readonly label: ExerciseTextView;
};

export type FillBlankTemplateSegment =
  | { readonly kind: "text"; readonly value: string }
  | { readonly kind: "blank"; readonly blankId: string };

export type FreeResponseExerciseView = {
  readonly id: string;
  readonly type: "free-response";
  readonly prompt: ExerciseTextView;
  readonly answerLanguage: SupportedLanguage;
};

export type ExercisePassageView = {
  readonly logicalId: string;
  readonly title: ExerciseTextView;
  readonly bodyKo: string;
};

export type ChoiceExerciseView = {
  readonly id: string;
  readonly type: "meaning-choice" | "honorific-choice" | "plain-choice" | "single-choice";
  readonly prompt: ExerciseTextView;
  readonly options: readonly ChoiceOptionView[];
  readonly passage: ExercisePassageView | null;
};

export type FillBlankExerciseView = {
  readonly id: string;
  readonly type: "fill-blank";
  readonly prompt: ExerciseTextView;
  readonly templateLanguage: SupportedLanguage;
  readonly segments: readonly FillBlankTemplateSegment[];
  readonly blankIds: readonly string[];
};

export type MatchingExerciseView = {
  readonly id: string;
  readonly type: "matching-translation" | "matching-honorific";
  readonly prompt: ExerciseTextView;
  readonly leftItems: readonly MatchingLeftItemView[];
  readonly rightOptions: readonly MatchingRightOptionView[];
};

export type ExerciseView =
  FreeResponseExerciseView | ChoiceExerciseView | FillBlankExerciseView | MatchingExerciseView;

export type ToExerciseViewOptions = {
  readonly seed?: number;
};

const FILL_BLANK_MARKER_PATTERN = /\{\{([A-Za-z0-9_-]+)\}\}/g;

export function toExerciseTextView(text: ExerciseText): ExerciseTextView {
  return {
    ko: text.ko,
    ru: text.ru,
  };
}

export function parseFillBlankTemplate(template: string): readonly FillBlankTemplateSegment[] {
  const segments: FillBlankTemplateSegment[] = [];
  let lastIndex = 0;

  for (const match of template.matchAll(FILL_BLANK_MARKER_PATTERN)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      segments.push({
        kind: "text",
        value: template.slice(lastIndex, matchIndex),
      });
    }

    segments.push({
      kind: "blank",
      blankId: match[1] ?? "",
    });
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < template.length) {
    segments.push({
      kind: "text",
      value: template.slice(lastIndex),
    });
  }

  return segments;
}

export function describeFillBlankTemplate(segments: readonly FillBlankTemplateSegment[]): string {
  return segments
    .map((segment) => {
      if (segment.kind === "text") {
        return segment.value;
      }

      return `«${segment.blankId}»`;
    })
    .join("");
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return hash;
}

export function toExerciseView(
  exercise: Exercise,
  options: ToExerciseViewOptions = {},
): ExerciseView {
  const prompt = toExerciseTextView(exercise.prompt);

  switch (exercise.type) {
    case "free-response":
      return {
        id: exercise.id,
        type: exercise.type,
        prompt,
        answerLanguage: exercise.answerLanguage,
      };
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
      return {
        id: exercise.id,
        type: exercise.type,
        prompt,
        options: exercise.options.map((option) => ({
          id: option.id,
          label: toExerciseTextView(option.label),
        })),
        passage: null,
      };
    case "single-choice": {
      const seed = options.seed ?? 0;
      const mappedOptions = exercise.options.map((option) => ({
        id: option.id,
        label: toExerciseTextView(option.label),
      }));
      return {
        id: exercise.id,
        type: exercise.type,
        prompt,
        options: seededShuffle(mappedOptions, seed ^ hashString(exercise.id)),
        passage: exercise.passage
          ? {
              logicalId: exercise.passage.logicalId,
              title: toExerciseTextView(exercise.passage.title),
              bodyKo: exercise.passage.bodyKo,
            }
          : null,
      };
    }
    case "fill-blank": {
      const segments = parseFillBlankTemplate(exercise.template);

      return {
        id: exercise.id,
        type: exercise.type,
        prompt,
        templateLanguage: exercise.templateLanguage,
        segments,
        blankIds: exercise.blanks.map((blank) => blank.id),
      };
    }
    case "matching-translation":
    case "matching-honorific": {
      const seed = options.seed ?? 0;
      const rightOptions = seededShuffle(
        exercise.pairs.map((pair) => ({
          pairId: pair.id,
          label: toExerciseTextView(pair.right),
        })),
        seed ^ hashString(exercise.id),
      );

      return {
        id: exercise.id,
        type: exercise.type,
        prompt,
        leftItems: exercise.pairs.map((pair) => ({
          pairId: pair.id,
          label: toExerciseTextView(pair.left),
        })),
        rightOptions,
      };
    }
  }
}
