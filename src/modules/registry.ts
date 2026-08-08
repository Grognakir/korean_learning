import { composeLearningContent } from "./composeLearningContent";

const composition = composeLearningContent(process.env.NODE_ENV ?? "production");

export const learningModuleRegistry = composition.learningModuleRegistry;
export const exerciseRepository = composition.exerciseRepository;
