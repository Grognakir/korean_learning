import type { LearningProgressOverview } from "../domain/progress";

export type ProgressRepository = {
  getOverviewForUser(userId: string): Promise<LearningProgressOverview>;
};
