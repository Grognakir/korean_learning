import { parseLearningModuleDefinition } from "@/lib/validation";
import type { LearningModuleDefinition } from "@/types";

import { selectPublishedModules } from "./moduleSelectors";

export type ModuleRegistryErrorCode =
  "duplicate-module-id" | "duplicate-module-slug" | "duplicate-topic-id";

export class ModuleRegistryError extends Error {
  readonly code: ModuleRegistryErrorCode;

  constructor(code: ModuleRegistryErrorCode, value: string) {
    super(`Module registry conflict (${code}): ${value}`);
    this.name = "ModuleRegistryError";
    this.code = code;
  }
}

export class ModuleRegistry {
  readonly #modulesById = new Map<string, LearningModuleDefinition>();
  readonly #modulesBySlug = new Map<string, LearningModuleDefinition>();
  readonly #topicIds = new Set<string>();

  constructor(definitions: readonly unknown[]) {
    definitions.forEach((definition) => this.register(definition));
  }

  getAll(): readonly LearningModuleDefinition[] {
    return [...this.#modulesById.values()].sort((left, right) => left.sortOrder - right.sortOrder);
  }

  getPublished(): readonly LearningModuleDefinition[] {
    return selectPublishedModules(this.getAll());
  }

  getById(id: string): LearningModuleDefinition | undefined {
    return this.#modulesById.get(id);
  }

  getBySlug(slug: string): LearningModuleDefinition | undefined {
    return this.#modulesBySlug.get(slug);
  }

  getPublishedBySlug(slug: string): LearningModuleDefinition | undefined {
    const learningModule = this.getBySlug(slug);

    return learningModule?.status === "published" ? learningModule : undefined;
  }

  private register(definition: unknown) {
    const learningModule = parseLearningModuleDefinition(definition);

    if (this.#modulesById.has(learningModule.id)) {
      throw new ModuleRegistryError("duplicate-module-id", learningModule.id);
    }

    if (this.#modulesBySlug.has(learningModule.slug)) {
      throw new ModuleRegistryError("duplicate-module-slug", learningModule.slug);
    }

    learningModule.topics.forEach((topic) => {
      if (this.#topicIds.has(topic.id)) {
        throw new ModuleRegistryError("duplicate-topic-id", topic.id);
      }
    });

    this.#modulesById.set(learningModule.id, learningModule);
    this.#modulesBySlug.set(learningModule.slug, learningModule);
    learningModule.topics.forEach((topic) => this.#topicIds.add(topic.id));
  }
}
