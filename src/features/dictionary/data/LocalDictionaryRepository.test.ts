import { describe, expect, it } from "vitest";

import { LocalDictionaryRepository } from "./LocalDictionaryRepository";

describe("LocalDictionaryRepository", () => {
  const repository = new LocalDictionaryRepository();

  it("keeps homonym senses separate and filterable", async () => {
    const page = await repository.listPage({ unitSlug: "u01", pageSize: 20 });
    expect(page.total).toBe(2);
    expect(page.homonymLemmas).toEqual(["안녕"]);
    expect(page.items.map((entry) => entry.senseKey).sort()).toEqual(["poka", "privet"]);

    const nouns = await repository.listPage({ unitSlug: "u02", pos: "noun" });
    expect(nouns.items).toHaveLength(1);
    expect(nouns.items[0]?.lemma).toBe("학교");
  });

  it("paginates stably without draft leakage", async () => {
    const first = await repository.listPage({ page: 1, pageSize: 1 });
    const second = await repository.listPage({ page: 2, pageSize: 1 });
    expect(first.items).toHaveLength(1);
    expect(second.items).toHaveLength(1);
    expect(first.items[0]?.logicalId).not.toBe(second.items[0]?.logicalId);
    expect(first.total).toBe(3);
  });
});
