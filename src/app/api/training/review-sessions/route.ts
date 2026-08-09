import type { NextRequest } from "next/server";

import { createReviewSession } from "@/features/review/application/createReviewSession";
import { trainingApiSuccessResponse } from "@/features/training/api/responses";
import { handleTrainingRoute } from "@/features/training/api/routeContext";

export async function POST(request: NextRequest) {
  return handleTrainingRoute(async ({ client, userId }) => {
    const session = await createReviewSession({
      client,
      userId,
    });

    return trainingApiSuccessResponse({ session }, 201);
  }, request);
}
