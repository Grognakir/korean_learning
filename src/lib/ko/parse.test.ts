import { describe, expect, it } from "vitest";
import { lexemes } from "@/lib/ko/lexicon";
import { parseLocationSentence } from "@/lib/ko/parse";

const allIds = lexemes.map((lexeme) => lexeme.id);

describe("parseLocationSentence", () => {
  it("parses front location with subject 가", () => {
    const result = parseLocationSentence("민수가 학교 앞에 있어요", allIds);
    expect(result).toEqual({
      ok: true,
      subjectId: "minsu",
      relation: "front",
      refIds: ["hakgyo"],
    });
  });

  it("parses between with 하고 and 있습니다", () => {
    const result = parseLocationSentence(
      "약국은 은행하고 서점 사이에 있습니다",
      allIds,
    );
    expect(result).toEqual({
      ok: true,
      subjectId: "yakguk",
      relation: "between",
      refIds: ["eunhaeng", "seojeom"],
    });
  });

  it("parses above and beside examples", () => {
    expect(parseLocationSentence("가방이 책상 위에 있다", allIds)).toEqual({
      ok: true,
      subjectId: "gabang",
      relation: "above",
      refIds: ["chaeksang"],
    });
    expect(parseLocationSentence("시계가 문 옆에 있어요", allIds)).toEqual({
      ok: true,
      subjectId: "sigye",
      relation: "beside",
      refIds: ["mun"],
    });
  });

  it("parses inside and strips final punctuation", () => {
    expect(parseLocationSentence("유나는 교실 안에 있어요", allIds)).toEqual({
      ok: true,
      subjectId: "yuna",
      relation: "inside",
      refIds: ["gyosil"],
    });
    expect(
      parseLocationSentence("컴퓨터가 책상 위에 있어요.", allIds),
    ).toEqual({
      ok: true,
      subjectId: "keompyuteo",
      relation: "above",
      refIds: ["chaeksang"],
    });
  });

  it("allows optional 의 before the position word", () => {
    expect(
      parseLocationSentence("민수가 학교의 뒤에 있어요", allIds),
    ).toEqual({
      ok: true,
      subjectId: "minsu",
      relation: "behind",
      refIds: ["hakgyo"],
    });
  });

  it("rejects missing verb", () => {
    const result = parseLocationSentence("민수가 학교 앞에", allIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorRu).toMatch(/동사|глагол|있다/i);
    }
  });

  it("rejects missing reference", () => {
    const result = parseLocationSentence("민수는 앞에 있어요", allIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorRu).toMatch(/ориентир/i);
    }
  });

  it("rejects 사이 with a single reference", () => {
    const result = parseLocationSentence("민수가 학교 사이에 있어요", allIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorRu).toMatch(/사이/);
    }
  });

  it("rejects wrong subject particle by batchim", () => {
    const result = parseLocationSentence("은행가 학교 옆에 있어요", allIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorRu).toContain("은행");
      expect(result.errorRu).toContain("이");
      expect(result.hintRu).toBe("은행이 …");
    }
  });

  it("rejects non-hangul input", () => {
    const result = parseLocationSentence("banana가 학교 앞에 있어요", allIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorRu).toMatch(/хангыль/i);
    }
  });

  it("rejects words outside the scene lexemeIds", () => {
    const sceneIds = ["minsu", "hakgyo"];
    const result = parseLocationSentence("민수가 은행 앞에 있어요", sceneIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorRu).toContain("은행");
      expect(result.errorRu).toMatch(/сцен/);
    }
  });

  it("rejects empty input", () => {
    const result = parseLocationSentence("   ", allIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorRu).toMatch(/пуст/i);
    }
  });
});
