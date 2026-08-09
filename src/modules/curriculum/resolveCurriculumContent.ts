import { LocalCatalogRepository } from "@/features/catalog/data/LocalCatalogRepository";
import type { CatalogRepository } from "@/features/catalog/data/CatalogRepository";
import { LocalDictionaryRepository } from "@/features/dictionary/data/LocalDictionaryRepository";
import type { DictionaryRepository } from "@/features/dictionary/data/DictionaryRepository";
import { LocalReadingRepository } from "@/features/reading/data/LocalReadingRepository";
import type { ReadingRepository } from "@/features/reading/data/ReadingRepository";

import { resolveContentSource } from "../contentSource";

export type CurriculumRepositories = {
  readonly catalogRepository: CatalogRepository;
  readonly dictionaryRepository: DictionaryRepository;
  readonly readingRepository: ReadingRepository;
};

function createLocalCurriculumRepositories(): CurriculumRepositories {
  return {
    catalogRepository: new LocalCatalogRepository(),
    dictionaryRepository: new LocalDictionaryRepository(),
    readingRepository: new LocalReadingRepository(),
  };
}

let cachedLocal: CurriculumRepositories | undefined;
let cachedSupabase: Promise<CurriculumRepositories> | undefined;

export function getLocalCurriculumRepositories(): CurriculumRepositories {
  if (!cachedLocal) {
    cachedLocal = createLocalCurriculumRepositories();
  }
  return cachedLocal;
}

async function createSupabaseCurriculumRepositories(): Promise<CurriculumRepositories> {
  const [
    { SupabaseCatalogRepository },
    { SupabaseDictionaryRepository },
    { SupabaseReadingRepository },
  ] = await Promise.all([
    import("@/features/catalog/data/SupabaseCatalogRepository"),
    import("@/features/dictionary/data/SupabaseDictionaryRepository"),
    import("@/features/reading/data/SupabaseReadingRepository"),
  ]);

  return {
    catalogRepository: new SupabaseCatalogRepository(),
    dictionaryRepository: new SupabaseDictionaryRepository(),
    readingRepository: new SupabaseReadingRepository(),
  };
}

export async function getCurriculumRepositories(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): Promise<CurriculumRepositories> {
  if (resolveContentSource(env) === "local") {
    return getLocalCurriculumRepositories();
  }

  if (!cachedSupabase) {
    cachedSupabase = createSupabaseCurriculumRepositories().catch((error: unknown) => {
      cachedSupabase = undefined;
      throw error;
    });
  }

  return cachedSupabase;
}
