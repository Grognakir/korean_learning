import { cacheLife, cacheTag } from "next/cache";

import type { CatalogQuery } from "@/features/catalog/domain/types";
import type { PublicUnitSummary } from "@/features/catalog/domain/types";
import type { PublicDictionaryEntry } from "@/features/dictionary/domain/types";
import type {
  PublicCurriculumExercise,
  PublicReadingPassage,
} from "@/features/reading/domain/types";

import type { ContentResult } from "../cachedLearningContent";
import { getCurriculumRepositories } from "./resolveCurriculumContent";

async function readSafe<T>(read: () => Promise<T>): Promise<ContentResult<T>> {
  try {
    return { status: "ready", data: await read() };
  } catch {
    return { status: "unavailable" };
  }
}

export async function getCachedPublicUnits(): Promise<ContentResult<readonly PublicUnitSummary[]>> {
  "use cache";
  cacheTag("curriculum-catalog");
  cacheLife("learningContent");

  return readSafe(async () => {
    const { catalogRepository } = await getCurriculumRepositories();
    const result = await catalogRepository.listUnits();
    return result.status === "ready" ? result.items : [];
  });
}

export async function getCachedPublicDictionary(
  unitSlug?: string,
): Promise<ContentResult<readonly PublicDictionaryEntry[]>> {
  "use cache";
  cacheTag("curriculum-dictionary");
  cacheLife("learningContent");

  return readSafe(async () => {
    const { dictionaryRepository } = await getCurriculumRepositories();
    return dictionaryRepository.list(unitSlug ? { unitSlug } : {});
  });
}

export async function getCachedPublicPassages(
  unitSlug?: string,
): Promise<ContentResult<readonly PublicReadingPassage[]>> {
  "use cache";
  cacheTag("curriculum-reading");
  cacheLife("learningContent");

  return readSafe(async () => {
    const { readingRepository } = await getCurriculumRepositories();
    return readingRepository.listPassages(unitSlug ? { unitSlug } : {});
  });
}

export async function getCachedApprovedCurriculumExercises(
  query: CatalogQuery = {},
): Promise<ContentResult<readonly PublicCurriculumExercise[]>> {
  "use cache";
  cacheTag("curriculum-reading");
  cacheLife("learningContent");

  return readSafe(async () => {
    const { readingRepository } = await getCurriculumRepositories();
    return readingRepository.listApprovedExercises(query);
  });
}
