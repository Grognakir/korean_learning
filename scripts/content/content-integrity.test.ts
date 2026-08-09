import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  assertNoAppContentImports,
  ContentValidationError,
  PHASE_2_CONTENT_ROOT,
  validatePhase2Content,
  validateSourceManifest,
} from "./contentValidation";

const tempRoots: string[] = [];

afterEach(() => {
  while (tempRoots.length > 0) {
    const root = tempRoots.pop();
    if (root) {
      rmSync(root, { force: true, recursive: true });
    }
  }
});

function createTempRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "phase-2-content-"));
  tempRoots.push(root);
  return root;
}

describe("phase-2 content baseline validation", () => {
  it("accepts the repository minimal source manifest", () => {
    const manifest = validatePhase2Content(PHASE_2_CONTENT_ROOT);

    expect(manifest.schemaVersion).toBe("phase-2.v1");
    expect(manifest.sources).toEqual([]);
  });

  it("rejects invalid JSON in the source manifest", () => {
    const root = createTempRoot();
    writeFileSync(path.join(root, "source-manifest.json"), "{ not-json", "utf8");

    expect(() => validatePhase2Content(root)).toThrow(ContentValidationError);
    expect(() => validatePhase2Content(root)).toThrow(/Invalid JSON/);
  });

  it("rejects an unknown schema version", () => {
    expect(() =>
      validateSourceManifest(
        { schemaVersion: "phase-2.v0-unknown", sources: [] },
        "source-manifest.json",
      ),
    ).toThrow(/Unknown schema version/);
  });

  it("passes the app-graph content import boundary for src/", () => {
    expect(() => assertNoAppContentImports()).not.toThrow();
  });

  it("fails when an app source file imports content/phase-2", () => {
    const root = createTempRoot();
    const appFile = path.join(root, "modules", "bad.ts");
    mkdirSync(path.dirname(appFile), { recursive: true });
    writeFileSync(
      appFile,
      'import manifest from "../../../content/phase-2/source-manifest.json";\nexport const value = manifest;\n',
      "utf8",
    );

    expect(() => assertNoAppContentImports(root)).toThrow(ContentValidationError);
    expect(() => assertNoAppContentImports(root)).toThrow(/Forbidden content\/phase-2 import/);
  });
});
