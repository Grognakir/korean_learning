import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { generateStaticParams as generateTopicStaticParams } from "@/app/topics/[moduleSlug]/page";
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

describe("honorifics production build gate", () => {
  it("keeps generateStaticParams free of honorifics under the default non-dev registry", () => {
    const params = generateTopicStaticParams();

    expect(params.map((entry) => entry.moduleSlug)).not.toContain("honorifics");
    expect(
      composeLearningContent(process.env.NODE_ENV ?? "test").modules.map((m) => m.slug),
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
