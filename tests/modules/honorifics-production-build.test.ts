import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { generateStaticParams as generateTopicStaticParams } from "@/app/topics/[moduleSlug]/page";
import { generateStaticParams as generateSessionStaticParams } from "@/app/training/[sessionId]/page";
import { DEMO_TRAINING_SESSION_ID } from "@/features/training";
import { composeLearningContent } from "@/modules";

const nextDirectory = path.join(process.cwd(), ".next");

function collectPaths(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory, { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    paths.push(fullPath);

    if (entry.isDirectory()) {
      paths.push(...collectPaths(fullPath));
    }
  }

  return paths;
}

describe("production build excludes removed honorifics preview", () => {
  it("keeps composition and static params free of honorifics", async () => {
    const params = await generateTopicStaticParams();
    const sessionParams = await generateSessionStaticParams();

    expect(params.map((entry) => entry.moduleSlug)).not.toContain("honorifics");
    expect(sessionParams.map((entry) => entry.sessionId)).toEqual([DEMO_TRAINING_SESSION_ID]);
    expect(
      composeLearningContent(process.env.NODE_ENV ?? "test").modules.map((module) => module.slug),
    ).not.toContain("honorifics");
    expect(
      composeLearningContent("development").modules.map((module) => module.slug),
    ).not.toContain("honorifics");
  });

  it("does not generate a public /topics/honorifics route after production build", () => {
    if (!existsSync(nextDirectory)) {
      expect(
        composeLearningContent("production").learningModuleRegistry.getBySlug("honorifics"),
      ).toBeUndefined();
      return;
    }

    const buildPaths = collectPaths(nextDirectory);
    const honorificsTopicArtifacts = buildPaths.filter((entry) =>
      entry.includes(`${path.sep}topics${path.sep}honorifics`),
    );

    expect(honorificsTopicArtifacts).toEqual([]);
  });
});
