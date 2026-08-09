import { cacheLife, cacheTag } from "next/cache";

import type {
  CatalogQuery,
  PublicGrammarTopicSummary,
  PublicUnitSummary,
} from "@/features/catalog/domain/types";
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

export async function getCachedPublicGrammarTopics(
  unitSlug?: string,
): Promise<ContentResult<readonly PublicGrammarTopicSummary[]>> {
  "use cache";
  cacheTag("curriculum-catalog");
  cacheLife("learningContent");

  return readSafe(async () => {
    const { catalogRepository } = await getCurriculumRepositories();
    const result = await catalogRepository.listGrammarTopics(unitSlug ? { unitSlug } : {});
    if (result.status === "ready") {
      return result.items;
    }
    return [];
  });
}

export async function getCachedPublicUnitBySlug(
  slug: string,
): Promise<ContentResult<PublicUnitSummary | null>> {
  "use cache";
  cacheTag("curriculum-catalog");
  cacheLife("learningContent");

  return readSafe(async () => {
    const { catalogRepository } = await getCurriculumRepositories();
    return (await catalogRepository.getUnitBySlug(slug)) ?? null;
  });
}

export async function getCachedPublicGrammarTopic(
  logicalId: string,
): Promise<ContentResult<PublicGrammarTopicSummary | null>> {
  "use cache";
  cacheTag("curriculum-catalog");
  cacheLife("learningContent");

  return readSafe(async () => {
    const { catalogRepository } = await getCurriculumRepositories();
    return (await catalogRepository.getGrammarTopicByLogicalId(logicalId)) ?? null;
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
