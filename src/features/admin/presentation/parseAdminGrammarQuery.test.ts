import { describe, expect, it } from "vitest";

import type { AdminGrammarTopicListItem } from "@/features/admin/data/adminContentRepository";

import {
  ADMIN_GRAMMAR_PAGE_SIZE,
  buildAdminGrammarHref,
  filterAdminGrammarTopics,
  paginateAdminGrammarTopics,
  parseAdminGrammarQuery,
} from "./parseAdminGrammarQuery";

function topic(
  overrides: Partial<AdminGrammarTopicListItem> & Pick<AdminGrammarTopicListItem, "id">,
): AdminGrammarTopicListItem {
  return {
    logicalId: `grammar.${overrides.id}`,
    moduleId: "unit-a",
    patternKo: "N이/가",
    titleRu: "Именительный падеж",
    status: "published",
    contentVersion: "1.0.0",
    sortOrder: 1,
    updatedAt: "2026-08-10T10:00:00.000Z",
    ...overrides,
  };
}

describe("parseAdminGrammarQuery", () => {
  it("parses filters and page with defaults", () => {
    expect(parseAdminGrammarQuery({})).toEqual({
      q: null,
      status: null,
      unitId: null,
      page: 1,
    });

    expect(
      parseAdminGrammarQuery({
        q: " 드리다 ",
        status: "draft",
        unit: "module-1",
        page: "3",
      }),
    ).toEqual({
      q: "드리다",
      status: "draft",
      unitId: "module-1",
      page: 3,
    });
  });

  it("ignores unknown status and invalid page", () => {
    expect(parseAdminGrammarQuery({ status: "nope", page: "0" })).toEqual({
      q: null,
      status: null,
      unitId: null,
      page: 1,
    });
  });
});

describe("buildAdminGrammarHref", () => {
  it("omits empty filters and page 1", () => {
    expect(buildAdminGrammarHref({})).toBe("/admin/grammar");
    expect(
      buildAdminGrammarHref({
        q: "가",
        status: "published",
        unitId: "u1",
        page: 2,
      }),
    ).toBe("/admin/grammar?q=%EA%B0%80&status=published&unit=u1&page=2");
  });
});

describe("filterAdminGrammarTopics", () => {
  const items = [
    topic({ id: "1", patternKo: "V-아/어 드리다", titleRu: "Вежливая просьба", status: "draft" }),
    topic({
      id: "2",
      moduleId: "unit-b",
      patternKo: "N이/가",
      titleRu: "Именительный",
      status: "published",
    }),
  ];

  it("filters by status, unit and search", () => {
    expect(filterAdminGrammarTopics(items, { q: "드리다", status: null, unitId: null })).toHaveLength(
      1,
    );
    expect(
      filterAdminGrammarTopics(items, { q: null, status: "published", unitId: null }),
    ).toHaveLength(1);
    expect(
      filterAdminGrammarTopics(items, { q: null, status: null, unitId: "unit-b" }),
    ).toHaveLength(1);
    expect(
      filterAdminGrammarTopics(items, {
        q: "именительный",
        status: "published",
        unitId: "unit-b",
      }),
    ).toHaveLength(1);
  });
});

describe("paginateAdminGrammarTopics", () => {
  it("pages filtered results by 10", () => {
    const items = Array.from({ length: 23 }, (_, index) =>
      topic({
        id: String(index + 1),
        titleRu: `Тема ${index + 1}`,
        status: index % 2 === 0 ? "published" : "draft",
      }),
    );

    const page1 = paginateAdminGrammarTopics(items, {
      q: null,
      status: "published",
      unitId: null,
      page: 1,
    });
    expect(page1.total).toBe(12);
    expect(page1.pageSize).toBe(ADMIN_GRAMMAR_PAGE_SIZE);
    expect(page1.totalPages).toBe(2);
    expect(page1.items).toHaveLength(10);

    const page2 = paginateAdminGrammarTopics(items, {
      q: null,
      status: "published",
      unitId: null,
      page: 2,
    });
    expect(page2.items).toHaveLength(2);
    expect(page2.page).toBe(2);
  });

  it("clamps page past the end", () => {
    const items = [topic({ id: "1" })];
    const result = paginateAdminGrammarTopics(items, {
      q: null,
      status: null,
      unitId: null,
      page: 9,
    });
    expect(result.page).toBe(1);
    expect(result.items).toHaveLength(1);
  });
});
