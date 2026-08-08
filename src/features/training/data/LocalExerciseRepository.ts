import { parseExerciseDefinition } from "@/lib/validation";

import type { Exercise } from "../domain";
import { ModuleRegistry } from "../domain";
import type { ExerciseQuery, ExerciseRepository } from "./ExerciseRepository";

export type ExerciseRepositoryErrorCode =
  | "duplicate-exercise-id"
  | "duplicate-logical-version"
  | "unknown-module"
  | "unknown-topic"
  | "unsupported-exercise-type";

export class ExerciseRepositoryError extends Error {
  readonly code: ExerciseRepositoryErrorCode;

  constructor(code: ExerciseRepositoryErrorCode, value: string) {
    super(`Exercise repository conflict (${code}): ${value}`);
    this.name = "ExerciseRepositoryError";
    this.code = code;
  }
}

export class LocalExerciseRepository implements ExerciseRepository {
  readonly #exercises: Exercise[] = [];
  readonly #exercisesById = new Map<string, Exercise>();
  readonly #logicalVersions = new Set<string>();
  readonly #moduleRegistry: ModuleRegistry;

  constructor(definitions: readonly unknown[], moduleRegistry: ModuleRegistry) {
    this.#moduleRegistry = moduleRegistry;
    definitions.forEach((definition) => this.register(definition));
  }

  getById(id: string): Exercise | undefined {
    return this.#exercisesById.get(id);
  }

  list(query: ExerciseQuery = {}): readonly Exercise[] {
    return this.#exercises.filter((exercise) => {
      if (query.moduleSlug !== undefined && exercise.moduleSlug !== query.moduleSlug) {
        return false;
      }

      if (
        query.topicIds !== undefined &&
        !query.topicIds.some((topicId) => exercise.topicIds.includes(topicId))
      ) {
        return false;
      }

      if (query.types !== undefined && !query.types.includes(exercise.type)) {
        return false;
      }

      if (query.difficulties !== undefined && !query.difficulties.includes(exercise.difficulty)) {
        return false;
      }

      return true;
    });
  }

  private register(definition: unknown) {
    const exercise = parseExerciseDefinition(definition);
    const logicalVersion = `${exercise.moduleSlug}:${exercise.logicalId}:${exercise.contentVersion}`;

    if (this.#exercisesById.has(exercise.id)) {
      throw new ExerciseRepositoryError("duplicate-exercise-id", exercise.id);
    }

    if (this.#logicalVersions.has(logicalVersion)) {
      throw new ExerciseRepositoryError("duplicate-logical-version", logicalVersion);
    }

    const learningModule = this.#moduleRegistry.getBySlug(exercise.moduleSlug);

    if (!learningModule) {
      throw new ExerciseRepositoryError("unknown-module", exercise.moduleSlug);
    }

    const moduleTopicIds = new Set(learningModule.topics.map((topic) => topic.id));

    exercise.topicIds.forEach((topicId) => {
      if (!moduleTopicIds.has(topicId)) {
        throw new ExerciseRepositoryError("unknown-topic", topicId);
      }
    });

    if (!learningModule.supportedExerciseTypes.includes(exercise.type)) {
      throw new ExerciseRepositoryError("unsupported-exercise-type", exercise.type);
    }

    this.#exercises.push(exercise);
    this.#exercisesById.set(exercise.id, exercise);
    this.#logicalVersions.add(logicalVersion);
  }
}
