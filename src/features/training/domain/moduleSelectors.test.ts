import { describe, expect, it } from "vitest";

import { sampleModule } from "@/modules/sample";
import type { LearningModuleDefinition } from "@/types";

import { selectPublishedModules, selectPublishedTopics } from "./moduleSelectors";

describe("module selectors", () => {
  it("returns only published modules in display order", () => {
    const draft = {
      ...sampleModule,
      id: "bc58b2e7-f6e9-42b7-9d60-d187ddcc44d0",
      slug: "draft-module",
      status: "draft",
      sortOrder: 0,
    } as const satisfies LearningModuleDefinition;

    expect(selectPublishedModules([draft, sampleModule]).map((module) => module.slug)).toEqual([
      "sample-module",
    ]);
  });

  it("returns only published topics in display order", () => {
    const learningModule = {
      ...sampleModule,
      topics: [
        { ...sampleModule.topics[1], sortOrder: 1 },
        { ...sampleModule.topics[0], status: "draft", sortOrder: 0 },
      ],
    } as const satisfies LearningModuleDefinition;

    expect(selectPublishedTopics(learningModule).map((topic) => topic.code)).toEqual([
      "first-phrases",
    ]);
  });
});
