import type { Exercise, ExerciseDifficulty } from "../domain";
import type { ExerciseTypeId } from "@/types";

export type ExerciseQuery = {
  readonly moduleSlug?: string;
  readonly topicIds?: readonly string[];
  readonly types?: readonly ExerciseTypeId[];
  readonly difficulties?: readonly ExerciseDifficulty[];
};

export interface ExerciseRepository {
  getById(id: string): Promise<Exercise | undefined>;
  list(query?: ExerciseQuery): Promise<readonly Exercise[]>;
}
