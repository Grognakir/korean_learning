import type { CatalogQuery } from "@/features/catalog/domain/types";

import type { PublicCurriculumExercise, PublicReadingPassage } from "../domain/types";

export interface ReadingRepository {
  listPassages(query?: Pick<CatalogQuery, "unitSlug">): Promise<readonly PublicReadingPassage[]>;
  getPassageByLogicalId(logicalId: string): Promise<PublicReadingPassage | undefined>;
  listApprovedExercises(query?: CatalogQuery): Promise<readonly PublicCurriculumExercise[]>;
}
