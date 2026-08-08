import { composeDevelopmentContent } from "./composeDevelopmentContent";
import {
  composeProductionContent,
  type LearningContentComposition,
} from "./composeProductionContent";

export type { LearningContentComposition } from "./composeProductionContent";

/**
 * Server-side content composition.
 * Draft honorifics preview is included only when nodeEnv === "development".
 */
export function composeLearningContent(
  nodeEnv: string = process.env.NODE_ENV ?? "production",
): LearningContentComposition {
  if (nodeEnv === "development") {
    return composeDevelopmentContent();
  }

  return composeProductionContent();
}
