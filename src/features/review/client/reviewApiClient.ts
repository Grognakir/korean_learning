import type { TrainingSessionResponse } from "@/features/training/api/schemas";

import type { LearningSkill } from "../domain/conceptKey";

type ApiErrorBody = {
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
  };
};

export type StartReviewSessionInput = {
  readonly skill?: LearningSkill | null;
  readonly unitSlug?: string | null;
};

export async function startReviewSession(
  input: StartReviewSessionInput = {},
): Promise<TrainingSessionResponse> {
  const body: Record<string, string> = {};
  if (input.skill) {
    body.skill = input.skill;
  }
  if (input.unitSlug) {
    body.unitSlug = input.unitSlug;
  }

  const response = await fetch("/api/training/review-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const payload = (await response.json()) as ApiErrorBody;
      if (payload.error?.message) {
        message = payload.error.message;
      }
    } catch {
      // keep status message
    }

    throw new Error(message);
  }

  const payload = (await response.json()) as { session: TrainingSessionResponse };
  return payload.session;
}
