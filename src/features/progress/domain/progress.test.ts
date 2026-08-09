import { describe, expect, it } from "vitest";

import {
  computeAccuracy,
  computeModuleMasteryStatus,
  computeTopicMasteryStatus,
  formatAccuracyPercent,
} from "./progress";

describe("computeTopicMasteryStatus", () => {
  it("returns not_started for zero attempts", () => {
    expect(computeTopicMasteryStatus(0, 0)).toBe("not_started");
  });

  it("returns learning below practiced thresholds", () => {
    expect(computeTopicMasteryStatus(1, 1)).toBe("learning");
    expect(computeTopicMasteryStatus(2, 2)).toBe("learning");
    expect(computeTopicMasteryStatus(3, 2)).toBe("learning");
  });

  it("returns practiced at 3 attempts and 80% accuracy boundary", () => {
    expect(computeTopicMasteryStatus(3, 2)).toBe("learning");
    expect(computeTopicMasteryStatus(5, 4)).toBe("practiced");
    expect(computeTopicMasteryStatus(3, 3)).toBe("practiced");
  });
});

describe("computeModuleMasteryStatus", () => {
  it("returns not_started without module attempts", () => {
    expect(
      computeModuleMasteryStatus({
        moduleAttemptsCount: 0,
        publishedTopicCount: 2,
        practicedTopicCount: 0,
      }),
    ).toBe("not_started");
  });

  it("returns practiced only when all published topics are practiced", () => {
    expect(
      computeModuleMasteryStatus({
        moduleAttemptsCount: 10,
        publishedTopicCount: 2,
        practicedTopicCount: 1,
      }),
    ).toBe("learning");

    expect(
      computeModuleMasteryStatus({
        moduleAttemptsCount: 10,
        publishedTopicCount: 2,
        practicedTopicCount: 2,
      }),
    ).toBe("practiced");
  });
});

describe("computeAccuracy", () => {
  it("handles 79% and 80% boundaries", () => {
    expect(computeAccuracy(79, 100)).toBeCloseTo(0.79);
    expect(computeAccuracy(80, 100)).toBeCloseTo(0.8);
    expect(formatAccuracyPercent(0.794)).toBe("79%");
    expect(formatAccuracyPercent(0.805)).toBe("81%");
  });
});
