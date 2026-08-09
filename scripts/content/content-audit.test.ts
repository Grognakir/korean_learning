import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PHASE_2_CONTENT_ROOT } from "./contentValidation";

const REPORT_PATH = path.join(PHASE_2_CONTENT_ROOT, "content-audit-report.json");

describe("phase-2 content audit gate", () => {
  it("has a CP-9-pending audit report with approved minimum correspondence", () => {
    expect(existsSync(REPORT_PATH)).toBe(true);
    const report = JSON.parse(readFileSync(REPORT_PATH, "utf8")) as {
      checkpoint: { id: string; status: string };
      correspondence: {
        topicsUnits: boolean;
        grammarTopics: boolean;
        grammarPerUnitExact: boolean;
        readingExamQuestions: boolean;
        readingBaselineQuestions: boolean;
      };
      counts: {
        units: { byStatus: Record<string, number> };
        grammarTopics: { byStatus: Record<string, number> };
        exercises: {
          grammar: number;
          vocabulary: number;
          reading: number;
          readingByStatus: Record<string, number>;
        };
      };
      security: { absoluteLocalPathHits: unknown[] };
      vocabularyBoundary: { approved: number; businessDraft: number };
      openQuestionsForCp9: string[];
      auditDoc: string;
    };

    expect(report.checkpoint.id).toBe("CP-9");
    expect(report.checkpoint.status).toBe("pending_user_acceptance");
    expect(report.auditDoc).toBe("docs/PHASE_2_CONTENT_AUDIT.md");
    expect(report.correspondence.topicsUnits).toBe(true);
    expect(report.correspondence.grammarTopics).toBe(true);
    expect(report.correspondence.grammarPerUnitExact).toBe(true);
    expect(report.correspondence.readingExamQuestions).toBe(true);
    expect(report.correspondence.readingBaselineQuestions).toBe(true);
    expect(report.counts.units.byStatus.approved).toBe(16);
    expect(report.counts.grammarTopics.byStatus.approved).toBe(80);
    expect(report.counts.exercises).toEqual({
      grammar: 160,
      vocabulary: 64,
      reading: 148,
      readingByStatus: { draft: 100, approved: 48 },
    });
    expect(report.security.absoluteLocalPathHits).toEqual([]);
    expect(report.vocabularyBoundary.approved).toBeGreaterThanOrEqual(192);
    expect(report.vocabularyBoundary.businessDraft).toBeGreaterThan(0);
    expect(report.openQuestionsForCp9.length).toBeGreaterThanOrEqual(3);
  });
});
