import type { NextRequest } from "next/server";

import { trainingApiSuccessResponse } from "@/features/training/api/responses";
import { handleTrainingRoute, parseJsonBody } from "@/features/training/api/routeContext";
import { submitTrainingAttemptRequestSchema } from "@/features/training/api/schemas";
import { submitTrainingAttempt } from "@/features/training/application/trainingPersistence";

type AttemptRouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: NextRequest, context: AttemptRouteContext) {
  const { sessionId } = await context.params;

  return handleTrainingRoute(async ({ client, request, userId }) => {
    const body = await parseJsonBody(request, submitTrainingAttemptRequestSchema);
    const result = await submitTrainingAttempt({
      client,
      userId,
      sessionId,
      request: body,
    });

    return trainingApiSuccessResponse(result);
  }, request);
}
