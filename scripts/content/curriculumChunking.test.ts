import { describe, expect, it } from "vitest";

import {
  groupCurriculumStatements,
  packCurriculumGroups,
  splitCurriculumSql,
} from "./curriculumChunking";

describe("curriculum SQL chunking", () => {
  it("keeps every exercise and its deferred skill targets in one transaction", () => {
    const sql = `begin;
insert into public.learning_modules values ('u01');
delete from public.exercise_options where exercise_id = 'e1';
delete from public.exercise_topics where exercise_id = 'e1';
insert into public.exercises values ('e1', 'vocabulary');
insert into public.exercise_dictionary_entries values ('e1', 'd1', 'target');
delete from public.exercise_options where exercise_id = 'e2';
insert into public.exercises values ('e2', 'grammar');
insert into public.exercise_topics values ('e2', 'g1', 'primary');
insert into public.content_provenance values ('p1');
commit;`;

    const groups = groupCurriculumStatements(splitCurriculumSql(sql));

    expect(groups).toHaveLength(4);
    expect(groups[1]?.join("\n")).toContain("exercise_id = 'e1'");
    expect(groups[1]?.join("\n")).toContain("exercise_dictionary_entries");
    expect(groups[2]?.join("\n")).toContain("exercise_id = 'e2'");
    expect(groups[2]?.join("\n")).toContain("exercise_topics values");
    expect(groups[3]?.join("\n")).toContain("content_provenance");
  });

  it("never splits an atomic group while packing chunks", () => {
    const groups = [["first;"], ["exercise;", "target;"], ["last;"]];
    const chunks = packCurriculumGroups(groups, 24);

    expect(chunks).toEqual(["first;", "exercise;\n\ntarget;", "last;"]);
  });
});
