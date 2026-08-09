import { NextResponse } from "next/server";

import { TrainingPersistenceError } from "../application/errors";

export function trainingApiErrorResponse(error: unknown): NextResponse {
  if (error instanceof TrainingPersistenceError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "PERSISTENCE_FAILED",
        message: "Training persistence request failed.",
      },
    },
    { status: 503 },
  );
}

export function trainingApiSuccessResponse<T>(body: T, status = 200): NextResponse {
  return NextResponse.json(body, { status });
}
