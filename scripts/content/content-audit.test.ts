import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PHASE_2_CONTENT_ROOT } from "./contentValidation";

const REPORT_PATH = path.join(PHASE_2_CONTENT_ROOT, "content-audit-report.json");

describe("phase-2 content audit gate", () => {
  it("has a CP-6 pending audit report with canonical correspondence", () => {
    expect(existsSync(REPORT_PATH)).toBe(true);
    const report = JSON.parse(readFileSync(REPORT_PATH, "utf8")) as {
      checkpoint: { id: string; status: string };
      correspondence: {
        topicsUnits: boolean;
        grammarTopics: boolean;
        grammarPerUnitExact: boolean;
        readingExamQuestions: boolean;
      };
      security: { absoluteLocalPathHits: unknown[] };
      vocabularyBoundary: { approved: number; businessDraft: number };
      openQuestionsForCp6: string[];
      auditDoc: string;
    };

    expect(report.checkpoint.id).toBe("CP-6");
    expect(report.checkpoint.status).toBe("pending_user_acceptance");
    expect(report.auditDoc).toBe("docs/PHASE_2_CONTENT_AUDIT.md");
    expect(report.correspondence.topicsUnits).toBe(true);
    expect(report.correspondence.grammarTopics).toBe(true);
    expect(report.correspondence.grammarPerUnitExact).toBe(true);
    expect(report.correspondence.readingExamQuestions).toBe(true);
    expect(report.security.absoluteLocalPathHits).toEqual([]);
    expect(report.vocabularyBoundary.approved).toBe(0);
    expect(report.vocabularyBoundary.businessDraft).toBeGreaterThan(0);
    expect(report.openQuestionsForCp6.length).toBeGreaterThanOrEqual(3);
  });
});
