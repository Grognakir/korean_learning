import {
  composeProductionContent,
  type LearningContentComposition,
} from "./composeProductionContent";

export type { LearningContentComposition } from "./composeProductionContent";

/** Server-side content composition for local fixtures (sample module only). */
export function composeLearningContent(
  nodeEnv: string = process.env.NODE_ENV ?? "production",
): LearningContentComposition {
  void nodeEnv;
  return composeProductionContent();
}
