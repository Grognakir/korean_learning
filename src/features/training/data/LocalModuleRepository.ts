import type { LearningModuleDefinition } from "@/types";

import { ModuleRegistry } from "../domain";

import type { ModuleRepository } from "./ModuleRepository";

export class LocalModuleRepository implements ModuleRepository {
  readonly #registry: ModuleRegistry;

  constructor(registry: ModuleRegistry) {
    this.#registry = registry;
  }

  getAll(): Promise<readonly LearningModuleDefinition[]> {
    return Promise.resolve(this.#registry.getAll());
  }

  getPublished(): Promise<readonly LearningModuleDefinition[]> {
    return Promise.resolve(this.#registry.getPublished());
  }

  getById(id: string): Promise<LearningModuleDefinition | undefined> {
    return Promise.resolve(this.#registry.getById(id));
  }

  getBySlug(slug: string): Promise<LearningModuleDefinition | undefined> {
    return Promise.resolve(this.#registry.getBySlug(slug));
  }

  getPublishedBySlug(slug: string): Promise<LearningModuleDefinition | undefined> {
    return Promise.resolve(this.#registry.getPublishedBySlug(slug));
  }
}
