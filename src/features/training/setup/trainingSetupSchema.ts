import { z } from "zod";

export const learningSkillSchema = z.enum(["grammar", "vocabulary", "reading"]);

export const trainingSetupRequestSchema = z.object({
  skill: learningSkillSchema,
  unitSlug: z.string().trim().min(1),
  grammarTopicId: z.string().trim().min(1).nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).nullable(),
  sessionSize: z.number().int().min(1).max(50),
});

export type TrainingSetupRequest = z.infer<typeof trainingSetupRequestSchema>;

export function parseTrainingSetupRequest(input: unknown): TrainingSetupRequest | null {
  const parsed = trainingSetupRequestSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}
