import type { TrainingSessionResponse } from "@/features/training/api/schemas";

type ApiErrorBody = {
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
  };
};

export async function startReviewSession(): Promise<TrainingSessionResponse> {
  const response = await fetch("/api/training/review-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    credentials: "same-origin",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body.error?.message) {
        message = body.error.message;
      }
    } catch {
      // keep status message
    }

    throw new Error(message);
  }

  const payload = (await response.json()) as { session: TrainingSessionResponse };
  return payload.session;
}
