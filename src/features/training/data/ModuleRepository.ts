import type { LearningModuleDefinition } from "@/types";

export interface ModuleRepository {
  getAll(): Promise<readonly LearningModuleDefinition[]>;
  getPublished(): Promise<readonly LearningModuleDefinition[]>;
  getById(id: string): Promise<LearningModuleDefinition | undefined>;
  getBySlug(slug: string): Promise<LearningModuleDefinition | undefined>;
  getPublishedBySlug(slug: string): Promise<LearningModuleDefinition | undefined>;
}
