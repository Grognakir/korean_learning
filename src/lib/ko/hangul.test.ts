import { describe, expect, it } from "vitest";
import {
  andParticle,
  hasBatchim,
  isHangul,
  subjectParticle,
  topicParticle,
} from "@/lib/ko/hangul";

describe("hangul utils", () => {
  it("detects batchim on the last syllable", () => {
    expect(hasBatchim("학교")).toBe(false);
    expect(hasBatchim("은행")).toBe(true);
    expect(hasBatchim("서울")).toBe(true);
  });

  it("picks subject, topic, and and-particles", () => {
    expect(subjectParticle("학교")).toBe("가");
    expect(topicParticle("학교")).toBe("는");
    expect(andParticle("학교")).toBe("와");

    expect(subjectParticle("집")).toBe("이");
    expect(topicParticle("집")).toBe("은");
    expect(andParticle("집")).toBe("과");

    expect(subjectParticle("서울")).toBe("이");
    expect(subjectParticle("약국")).toBe("이");
    expect(andParticle("카페")).toBe("와");
  });

  it("checks hangul text and tolerates empty or latin input", () => {
    expect(isHangul("학교 앞")).toBe(true);
    expect(isHangul("")).toBe(true);
    expect(isHangul("abc")).toBe(false);
    expect(hasBatchim("")).toBe(false);
    expect(hasBatchim("abc")).toBe(false);
    expect(subjectParticle("")).toBe("가");
    expect(topicParticle("latin")).toBe("는");
    expect(andParticle("")).toBe("와");
  });
});
