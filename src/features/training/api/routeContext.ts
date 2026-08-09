import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { z } from "zod";

import { getServerAuthUser } from "@/features/authentication/server/getServerAuthUser";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

import { trainingApiErrorResponse } from "./responses";
import { TrainingPersistenceError } from "../application/errors";

export type TrainingRouteContext = {
  readonly userId: string;
  readonly client: Awaited<ReturnType<typeof createServerSupabaseClient>>;
};

export async function createTrainingRouteContext(): Promise<TrainingRouteContext> {
  const user = await getServerAuthUser();
  if (!user) {
    throw new TrainingPersistenceError("UNAUTHORIZED", "Authentication is required.", 401);
  }

  return {
    userId: user.id,
    client: await createServerSupabaseClient(),
  };
}

export async function handleTrainingRoute(
  handler: (
    input: TrainingRouteContext & { readonly request: NextRequest },
  ) => Promise<NextResponse>,
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const context = await createTrainingRouteContext();
    return await handler({ ...context, request });
  } catch (error) {
    return trainingApiErrorResponse(error);
  }
}

export async function parseJsonBody<TSchema extends z.ZodType>(
  request: NextRequest,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new TrainingPersistenceError(
      "VALIDATION_FAILED",
      "Request body must be valid JSON.",
      400,
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new TrainingPersistenceError("VALIDATION_FAILED", "Request body is invalid.", 400);
  }

  return parsed.data;
}
