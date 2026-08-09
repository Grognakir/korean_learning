import type { NextRequest } from "next/server";

import { trainingApiSuccessResponse } from "@/features/training/api/responses";
import { handleTrainingRoute, parseJsonBody } from "@/features/training/api/routeContext";
import { startTrainingSessionRequestSchema } from "@/features/training/api/schemas";
import { startTrainingSession } from "@/features/training/application/trainingPersistence";

export async function POST(request: NextRequest) {
  return handleTrainingRoute(async ({ client, request, userId }) => {
    const body = await parseJsonBody(request, startTrainingSessionRequestSchema);
    const session = await startTrainingSession({
      client,
      userId,
      request: body,
    });

    return trainingApiSuccessResponse({ session }, 201);
  }, request);
}
