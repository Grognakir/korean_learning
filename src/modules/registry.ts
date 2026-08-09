import { getLocalLearningContent } from "./resolveLearningContent";

const composition = getLocalLearningContent(process.env.NODE_ENV ?? "production");

export const learningModuleRegistry = composition.learningModuleRegistry;
export const moduleRepository = composition.moduleRepository;
export const exerciseRepository = composition.exerciseRepository;
