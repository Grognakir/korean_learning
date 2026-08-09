import { describe, expect, it } from "vitest";

import { normalizeTopicCode } from "./moduleMapper";

describe("module mapper", () => {
  it("normalizes curriculum topic codes to the learning-module slug contract", () => {
    expect(normalizeTopicCode("u01.n01")).toBe("u01-n01");
    expect(normalizeTopicCode(" grammar.u16.n05 ")).toBe("grammar-u16-n05");
  });
});
