import { describe, expect, it } from "vitest";

import {
  buildCurriculumSeedSql,
  mapContentStatus,
  mapDifficulty,
  mapExerciseStatus,
  uuidFromKey,
} from "./curriculumSeedSql";

describe("curriculum seed SQL builder", () => {
  it("maps statuses without elevation above authoring intent", () => {
    expect(mapContentStatus("draft")).toBe("draft");
    expect(mapContentStatus("needs_review")).toBe("draft");
    expect(mapContentStatus("reviewed")).toBe("reviewed");
    expect(mapContentStatus("approved")).toBe("published");
    expect(mapExerciseStatus("draft")).toBe("draft");
    expect(mapExerciseStatus("approved")).toBe("approved");
    expect(mapDifficulty("intro")).toBe("easy");
    expect(mapDifficulty("practice")).toBe("medium");
    expect(mapDifficulty("challenge")).toBe("hard");
  });

  it("builds deterministic SQL and stable UUIDs for the authoring graph", () => {
    const first = buildCurriculumSeedSql("insert");
    const second = buildCurriculumSeedSql("insert");

    expect(first.sql).toBe(second.sql);
    expect(first.stats.modules).toBe(16);
    expect(first.stats.grammarTopics).toBe(80);
    expect(first.stats.dictionaryEntries).toBe(1091);
    expect(first.stats.readingPassages).toBe(178);
    expect(first.stats.exercises).toBe(372);
    expect(first.stats.dictionaryLinks).toBe(192);
    expect(first.sql).toContain("'grammar'");
    expect(first.sql).toContain("'vocabulary'");
    expect(first.sql).toContain("accepted_answers");
    expect(first.sql).toContain("'secondary'");
    expect(first.sql).toContain("matching-translation");
    expect(uuidFromKey("module:unit.u01@1.0.0")).toBe(uuidFromKey("module:unit.u01@1.0.0"));
    expect(first.sql).toContain("learning_skill");
    expect(first.sql).toContain("'reading'");
    expect(first.sql.includes("/Users/")).toBe(false);

    const upsert = buildCurriculumSeedSql("upsert");
    expect(upsert.sql).toContain("status = learning_modules.status");
    expect(upsert.sql).toContain("status = exercises.status");
    expect(upsert.sql).toContain("delete from public.accepted_answers");
    expect(upsert.sql).toContain("delete from public.content_provenance");
  });
});
