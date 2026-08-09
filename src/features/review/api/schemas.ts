import { z } from "zod";

export const createReviewSessionRequestSchema = z
  .object({
    skill: z.enum(["grammar", "vocabulary", "reading"]).optional(),
    unitSlug: z.string().trim().min(1).optional(),
    moduleId: z.string().uuid().optional(),
    idempotencyKey: z.string().trim().min(1).optional(),
  })
  .strict();

export type CreateReviewSessionRequest = z.infer<typeof createReviewSessionRequestSchema>;
