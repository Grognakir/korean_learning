import "server-only";

import { unstable_cache } from "next/cache";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";
import type { LearningModuleDefinition } from "@/types";

import { ModuleRegistry, selectPublishedModules } from "../domain";
import type { ModuleRepository } from "./ModuleRepository";
import { deriveSupportedExerciseTypes, mapModuleRows } from "./mappers/moduleMapper";

export class SupabaseModuleRepositoryError extends Error {
  readonly code = "SUPABASE_MODULE_REPOSITORY_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "SupabaseModuleRepositoryError";
  }
}

const CACHE_TAG = "learning-modules";

async function loadPublishedModules(): Promise<readonly LearningModuleDefinition[]> {
  const client = createServiceRoleSupabaseClient();

  const [{ data: moduleRows, error: moduleError }, { data: topicRows, error: topicError }] =
    await Promise.all([
      client
        .from("learning_modules")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      client.from("grammar_topics").select("*").eq("status", "published").order("sort_order", {
        ascending: true,
      }),
    ]);

  if (moduleError) {
    throw new SupabaseModuleRepositoryError(moduleError.message);
  }

  if (topicError) {
    throw new SupabaseModuleRepositoryError(topicError.message);
  }

  const publishedModuleIds = new Set((moduleRows ?? []).map((row) => row.id));
  const filteredTopics = (topicRows ?? []).filter((row) => publishedModuleIds.has(row.module_id));

  const { data: exerciseTypeRows, error: exerciseTypeError } = await client
    .from("exercises")
    .select("module_id,type")
    .eq("status", "approved")
    .in("module_id", [...publishedModuleIds]);

  if (exerciseTypeError) {
    throw new SupabaseModuleRepositoryError(exerciseTypeError.message);
  }

  const supportedExerciseTypesByModuleId = deriveSupportedExerciseTypes(
    (exerciseTypeRows ?? []).map((row) => ({
      moduleId: row.module_id,
      type: row.type,
    })),
  );

  return mapModuleRows(moduleRows ?? [], filteredTopics, supportedExerciseTypesByModuleId);
}

const getCachedPublishedModules = unstable_cache(loadPublishedModules, ["learning-modules"], {
  tags: [CACHE_TAG],
});

export class SupabaseModuleRepository implements ModuleRepository {
  readonly #registryPromise: Promise<ModuleRegistry>;

  constructor(
    loadModules: () => Promise<readonly LearningModuleDefinition[]> = getCachedPublishedModules,
  ) {
    this.#registryPromise = loadModules().then((modules) => new ModuleRegistry(modules));
  }

  async #registry(): Promise<ModuleRegistry> {
    return this.#registryPromise;
  }

  async getAll(): Promise<readonly LearningModuleDefinition[]> {
    const registry = await this.#registry();
    return registry.getAll();
  }

  async getPublished(): Promise<readonly LearningModuleDefinition[]> {
    const registry = await this.#registry();
    return registry.getPublished();
  }

  async getById(id: string): Promise<LearningModuleDefinition | undefined> {
    const registry = await this.#registry();
    return registry.getById(id);
  }

  async getBySlug(slug: string): Promise<LearningModuleDefinition | undefined> {
    const registry = await this.#registry();
    return registry.getBySlug(slug);
  }

  async getPublishedBySlug(slug: string): Promise<LearningModuleDefinition | undefined> {
    const registry = await this.#registry();
    return registry.getPublishedBySlug(slug);
  }
}

export async function listPublishedModulesDirect(): Promise<readonly LearningModuleDefinition[]> {
  return selectPublishedModules(await getCachedPublishedModules());
}
