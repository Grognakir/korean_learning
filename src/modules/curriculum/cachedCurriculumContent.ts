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
import { EnvValidationError } from "@/lib/validation/env";

import type { ContentResult } from "../cachedLearningContent";
import { CurriculumContentError } from "./CurriculumContentError";
import { getCurriculumRepositories } from "./resolveCurriculumContent";

async function readSafe<T>(read: () => Promise<T>): Promise<ContentResult<T>> {
  try {
    return { status: "ready", data: await read() };
  } catch (error) {
    if (!(error instanceof CurriculumContentError) && !(error instanceof EnvValidationError)) {
      throw error;
    }

    console.error(`Curriculum content unavailable: ${error.name}: ${error.message}`);
    return { status: "unavailable" };
  }
}

function cacheLifeFor(status: ContentResult<unknown>["status"]): void {
  if (status === "ready") {
    cacheLife("learningContent");
    return;
  }

  cacheLife("learningContentUnavailable");
}

export async function getCachedPublicUnits(): Promise<ContentResult<readonly PublicUnitSummary[]>> {
  "use cache";
  cacheTag("curriculum-catalog");

  const result = await readSafe(async () => {
    const { catalogRepository } = await getCurriculumRepositories();
    const result = await catalogRepository.listUnits();
    return result.status === "ready" ? result.items : [];
  });
  cacheLifeFor(result.status);

  return result;
}

export async function getCachedPublicGrammarTopics(
  unitSlug?: string,
): Promise<ContentResult<readonly PublicGrammarTopicSummary[]>> {
  "use cache";
  cacheTag("curriculum-catalog");

  const result = await readSafe(async () => {
    const { catalogRepository } = await getCurriculumRepositories();
    const result = await catalogRepository.listGrammarTopics(unitSlug ? { unitSlug } : {});
    if (result.status === "ready") {
      return result.items;
    }
    return [];
  });
  cacheLifeFor(result.status);

  return result;
}

export async function getCachedPublicUnitBySlug(
  slug: string,
): Promise<ContentResult<PublicUnitSummary | null>> {
  "use cache";
  cacheTag("curriculum-catalog");

  const result = await readSafe(async () => {
    const { catalogRepository } = await getCurriculumRepositories();
    return (await catalogRepository.getUnitBySlug(slug)) ?? null;
  });
  cacheLifeFor(result.status);

  return result;
}

export async function getCachedPublicGrammarTopic(
  logicalId: string,
): Promise<ContentResult<PublicGrammarTopicSummary | null>> {
  "use cache";
  cacheTag("curriculum-catalog");

  const result = await readSafe(async () => {
    const { catalogRepository } = await getCurriculumRepositories();
    return (await catalogRepository.getGrammarTopicByLogicalId(logicalId)) ?? null;
  });
  cacheLifeFor(result.status);

  return result;
}

export async function getCachedPublicDictionary(
  unitSlug?: string,
): Promise<ContentResult<readonly PublicDictionaryEntry[]>> {
  "use cache";
  cacheTag("curriculum-dictionary");

  const result = await readSafe(async () => {
    const { dictionaryRepository } = await getCurriculumRepositories();
    return dictionaryRepository.list(unitSlug ? { unitSlug } : {});
  });
  cacheLifeFor(result.status);

  return result;
}

export async function getCachedPublicDictionaryPage(query: {
  readonly unitSlug?: string;
  readonly pos?: string;
  readonly page?: number;
  readonly pageSize?: number;
}) {
  "use cache";
  cacheTag("curriculum-dictionary");

  const result = await readSafe(async () => {
    const { dictionaryRepository } = await getCurriculumRepositories();
    return dictionaryRepository.listPage(query);
  });
  cacheLifeFor(result.status);

  return result;
}

export async function getCachedPublicPassages(
  unitSlug?: string,
): Promise<ContentResult<readonly PublicReadingPassage[]>> {
  "use cache";
  cacheTag("curriculum-reading");

  const result = await readSafe(async () => {
    const { readingRepository } = await getCurriculumRepositories();
    return readingRepository.listPassages(unitSlug ? { unitSlug } : {});
  });
  cacheLifeFor(result.status);

  return result;
}

export async function getCachedApprovedCurriculumExercises(
  query: CatalogQuery = {},
): Promise<ContentResult<readonly PublicCurriculumExercise[]>> {
  "use cache";
  cacheTag("curriculum-reading");

  const result = await readSafe(async () => {
    const { readingRepository } = await getCurriculumRepositories();
    return readingRepository.listApprovedExercises(query);
  });
  cacheLifeFor(result.status);

  return result;
}
