import { describe, expect, it } from "vitest";

import { compareByUpdatedAtThenUnitNumber } from "./adminUiHelpers";

describe("compareByUpdatedAtThenUnitNumber", () => {
  it("sorts newer updates first", () => {
    const items = [
      { updatedAt: "2026-08-10T10:00:00.000Z", unitNumber: 2 },
      { updatedAt: "2026-08-11T10:00:00.000Z", unitNumber: 1 },
    ];

    expect([...items].sort(compareByUpdatedAtThenUnitNumber).map((item) => item.unitNumber)).toEqual(
      [1, 2],
    );
  });

  it("uses unit number ascending when timestamps match", () => {
    const stamp = "2026-08-10T14:59:42.000Z";
    const items = [
      { updatedAt: stamp, unitNumber: 9 },
      { updatedAt: stamp, unitNumber: 2 },
      { updatedAt: stamp, unitNumber: null },
      { updatedAt: stamp, unitNumber: 5 },
    ];

    expect([...items].sort(compareByUpdatedAtThenUnitNumber).map((item) => item.unitNumber)).toEqual(
      [2, 5, 9, null],
    );
  });
});
