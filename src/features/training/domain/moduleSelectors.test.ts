import { describe, expect, it } from "vitest";

import { sampleModule } from "@/modules/sample";
import type { LearningModuleDefinition } from "@/types";

import { selectPublishedModules, selectPublishedTopics } from "./moduleSelectors";

const publishedSample = {
  ...sampleModule,
  status: "published",
  topics: sampleModule.topics.map((topic) => ({ ...topic, status: "published" as const })),
} as const satisfies LearningModuleDefinition;

describe("module selectors", () => {
  it("returns only published modules in display order", () => {
    const draft = {
      ...publishedSample,
      id: "bc58b2e7-f6e9-42b7-9d60-d187ddcc44d0",
      slug: "draft-module",
      status: "draft",
      sortOrder: 0,
    } as const satisfies LearningModuleDefinition;

    expect(selectPublishedModules([draft, publishedSample]).map((module) => module.slug)).toEqual([
      "sample-module",
    ]);
  });

  it("returns only published topics in display order", () => {
    const [hangul, phrases] = publishedSample.topics;
    const learningModule = {
      ...publishedSample,
      topics: [
        { ...phrases!, sortOrder: 1 },
        { ...hangul!, status: "draft" as const, sortOrder: 0 },
      ],
    } satisfies LearningModuleDefinition;

    expect(selectPublishedTopics(learningModule).map((topic) => topic.code)).toEqual([
      "first-phrases",
    ]);
  });
});
