import { describe, expect, it } from "vitest";

import { sampleModule } from "@/modules/sample";

import { learningModuleDefinitionSchema } from "./learningModuleSchema";

describe("learningModuleDefinitionSchema", () => {
  it("accepts a complete learning module", () => {
    expect(learningModuleDefinitionSchema.parse(sampleModule)).toMatchObject({
      slug: "sample-module",
      contentVersion: "1.0.0",
    });
  });

  it("rejects an invalid content version", () => {
    const result = learningModuleDefinitionSchema.safeParse({
      ...sampleModule,
      contentVersion: "v1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects duplicate topic identifiers", () => {
    const firstTopic = sampleModule.topics[0];
    const result = learningModuleDefinitionSchema.safeParse({
      ...sampleModule,
      topics: [firstTopic, { ...sampleModule.topics[1], id: firstTopic.id }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects fields outside the contract", () => {
    const result = learningModuleDefinitionSchema.safeParse({
      ...sampleModule,
      hiddenFlag: true,
    });

    expect(result.success).toBe(false);
  });
});
