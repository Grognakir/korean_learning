import type {
  CompleteTrainingSessionRequest,
  ImportGuestTrainingSessionRequest,
  StartTrainingSessionRequest,
  SubmitTrainingAttemptRequest,
  SubmitTrainingAttemptResponse,
  TrainingSessionResponse,
} from "../api/schemas";

type ApiErrorBody = {
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
  };
};

async function readApiError(response: Response): Promise<Error> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    const message = body.error?.message ?? `Request failed with status ${response.status}.`;
    return new Error(message);
  } catch {
    return new Error(`Request failed with status ${response.status}.`);
  }
}

async function postJson<TResponse>(
  path: string,
  body: unknown,
  expectedStatus = 200,
): Promise<TResponse> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw await readApiError(response);
  }

  if (response.status !== expectedStatus && expectedStatus !== 200) {
    throw new Error(`Unexpected response status ${response.status}.`);
  }

  return (await response.json()) as TResponse;
}

export async function createTrainingSession(
  request: StartTrainingSessionRequest,
): Promise<TrainingSessionResponse> {
  const payload = await postJson<{ session: TrainingSessionResponse }>(
    "/api/training/sessions",
    request,
    201,
  );

  return payload.session;
}

export async function submitTrainingAttempt(
  sessionId: string,
  request: SubmitTrainingAttemptRequest,
): Promise<SubmitTrainingAttemptResponse> {
  return postJson<SubmitTrainingAttemptResponse>(
    `/api/training/sessions/${sessionId}/attempts`,
    request,
  );
}

export async function completeTrainingSession(
  sessionId: string,
  request: CompleteTrainingSessionRequest,
): Promise<TrainingSessionResponse> {
  const payload = await postJson<{ session: TrainingSessionResponse }>(
    `/api/training/sessions/${sessionId}/complete`,
    request,
  );

  return payload.session;
}

export async function importGuestTrainingSession(
  request: ImportGuestTrainingSessionRequest,
): Promise<TrainingSessionResponse> {
  const payload = await postJson<{ session: TrainingSessionResponse }>(
    "/api/training/import",
    request,
    201,
  );

  return payload.session;
}
