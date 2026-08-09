import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { trainingApiSuccessResponse } from "@/features/training/api/responses";
import { handleTrainingRoute, parseJsonBody } from "@/features/training/api/routeContext";
import { completeTrainingSessionRequestSchema } from "@/features/training/api/schemas";
import { completeTrainingSession } from "@/features/training/application/trainingPersistence";

type CompleteRouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: NextRequest, context: CompleteRouteContext) {
  const { sessionId } = await context.params;

  return handleTrainingRoute(async ({ client, request, userId }) => {
    const body = await parseJsonBody(request, completeTrainingSessionRequestSchema);
    const session = await completeTrainingSession({
      client,
      userId,
      sessionId,
      request: body,
    });

    revalidatePath("/progress");

    return trainingApiSuccessResponse({ session });
  }, request);
}
