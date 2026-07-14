import { describe, expect, it } from "vitest";
import {
  getTrueRelations,
  holds,
  resolveTargetCell,
  type RelationFact,
} from "@/lib/scene/relations";
import type { Scene, SceneEntity, SpatialRelation } from "@/lib/scene/types";

function streetScene(): Scene {
  return {
    id: "street-test",
    kind: "street",
    cols: 9,
    rows: 4,
    entities: [
      {
        id: "hakgyo",
        kind: "building",
        sprite: "school",
        ko: "학교",
        ru: "школа",
        col: 0,
        row: 1,
        w: 2,
        h: 2,
      },
      {
        id: "eunhaeng",
        kind: "building",
        sprite: "bank",
        ko: "은행",
        ru: "банк",
        col: 3,
        row: 1,
        w: 2,
        h: 2,
      },
      {
        id: "yakguk",
        kind: "building",
        sprite: "pharmacy",
        ko: "약국",
        ru: "аптека",
        col: 6,
        row: 1,
        w: 2,
        h: 2,
      },
      {
        id: "namu",
        kind: "decor",
        sprite: "tree",
        ko: "나무",
        ru: "дерево",
        col: 8,
        row: 3,
      },
      {
        id: "minsu",
        kind: "person",
        sprite: "person",
        ko: "민수",
        ru: "Минсу",
        col: 2,
        row: 1,
        movable: true,
      },
    ],
  };
}

function buildingCutScene(): Scene {
  return {
    id: "cut-test",
    kind: "building-cut",
    cols: 4,
    rows: 4,
    entities: [
      {
        id: "jip",
        kind: "building",
        sprite: "house",
        ko: "집",
        ru: "дом",
        col: 0,
        row: 0,
        w: 4,
        h: 4,
      },
      {
        id: "doseogwan",
        kind: "room",
        sprite: "library",
        ko: "도서관",
        ru: "библиотека",
        col: 0,
        row: 0,
        w: 2,
        h: 2,
        containerId: "jip",
      },
      {
        id: "samusil",
        kind: "room",
        sprite: "office",
        ko: "사무실",
        ru: "офис",
        col: 2,
        row: 0,
        w: 2,
        h: 2,
        containerId: "jip",
      },
      {
        id: "gyosil",
        kind: "room",
        sprite: "room",
        ko: "교실",
        ru: "класс",
        col: 0,
        row: 2,
        w: 2,
        h: 2,
        containerId: "jip",
      },
      {
        id: "hwajangsil",
        kind: "room",
        sprite: "toilet",
        ko: "화장실",
        ru: "туалет",
        col: 2,
        row: 2,
        w: 2,
        h: 2,
        containerId: "jip",
      },
      {
        id: "yuna",
        kind: "person",
        sprite: "person-2",
        ko: "유나",
        ru: "Юна",
        col: 0,
        row: 2,
        movable: true,
        containerId: "gyosil",
      },
    ],
  };
}

function applyCell(
  scene: Scene,
  subjectId: string,
  cell: { col: number; row: number; containerId?: string },
): Scene {
  return {
    ...scene,
    entities: scene.entities.map((entity) => {
      if (entity.id !== subjectId) {
        return entity;
      }
      const next: SceneEntity = { ...entity, col: cell.col, row: cell.row };
      if (cell.containerId !== undefined) {
        next.containerId = cell.containerId;
      } else {
        delete next.containerId;
      }
      return next;
    }),
  };
}

describe("scene relations", () => {
  it("finds between and near for a person between buildings", () => {
    const scene = streetScene();
    const facts = getTrueRelations(scene, "minsu");
    expect(facts).toContainEqual({
      relation: "between",
      refIds: ["hakgyo", "eunhaeng"],
    });
    expect(
      facts.some(
        (fact) =>
          fact.relation === "near" &&
          (fact.refIds[0] === "hakgyo" || fact.refIds[0] === "eunhaeng"),
      ),
    ).toBe(true);
    expect(facts.every((fact) => fact.refIds.every((id) => id !== "namu"))).toBe(
      true,
    );
  });

  it("checks above and below in a building cut", () => {
    const scene = buildingCutScene();
    expect(
      holds(scene, "yuna", { relation: "below", refIds: ["doseogwan"] }),
    ).toBe(true);

    const upstairs = applyCell(scene, "yuna", {
      col: 0,
      row: 0,
      containerId: "doseogwan",
    });
    expect(
      holds(upstairs, "yuna", { relation: "above", refIds: ["gyosil"] }),
    ).toBe(true);
  });

  it("checks inside and outside via containerId", () => {
    const scene = buildingCutScene();
    expect(
      holds(scene, "yuna", { relation: "inside", refIds: ["gyosil"] }),
    ).toBe(true);
    expect(
      holds(scene, "yuna", { relation: "outside", refIds: ["gyosil"] }),
    ).toBe(false);

    const outside = applyCell(scene, "yuna", { col: 3, row: 3 });
    expect(
      holds(outside, "yuna", { relation: "inside", refIds: ["gyosil"] }),
    ).toBe(false);
    expect(
      holds(outside, "yuna", { relation: "outside", refIds: ["hwajangsil"] }),
    ).toBe(true);
  });

  it("resolves beside, between, inside and returns null for impossible facts", () => {
    const street = streetScene();
    const beside = resolveTargetCell(street, "minsu", {
      relation: "beside",
      refIds: ["eunhaeng"],
    });
    expect(beside).not.toBeNull();
    if (beside) {
      const next = applyCell(street, "minsu", beside);
      expect(
        holds(next, "minsu", { relation: "beside", refIds: ["eunhaeng"] }),
      ).toBe(true);
    }

    const between = resolveTargetCell(street, "minsu", {
      relation: "between",
      refIds: ["eunhaeng", "yakguk"],
    });
    expect(between).toEqual({ col: 5, row: 1 });
    if (between) {
      const next = applyCell(street, "minsu", between);
      expect(
        holds(next, "minsu", {
          relation: "between",
          refIds: ["eunhaeng", "yakguk"],
        }),
      ).toBe(true);
    }

    const cut = buildingCutScene();
    const inside = resolveTargetCell(cut, "yuna", {
      relation: "inside",
      refIds: ["samusil"],
    });
    expect(inside).not.toBeNull();
    expect(inside?.containerId).toBe("samusil");
    if (inside) {
      const next = applyCell(cut, "yuna", inside);
      expect(
        holds(next, "yuna", { relation: "inside", refIds: ["samusil"] }),
      ).toBe(true);
    }

    expect(
      resolveTargetCell(cut, "yuna", {
        relation: "behind",
        refIds: ["doseogwan"],
      }),
    ).toBeNull();
  });

  it("roundtrips resolveTargetCell into holds for every reachable relation", () => {
    const street = streetScene();
    const cut = buildingCutScene();

    const cases: Array<{
      scene: Scene;
      subjectId: string;
      fact: RelationFact;
    }> = [
      {
        scene: street,
        subjectId: "minsu",
        fact: { relation: "left", refIds: ["eunhaeng"] },
      },
      {
        scene: street,
        subjectId: "minsu",
        fact: { relation: "right", refIds: ["hakgyo"] },
      },
      {
        scene: street,
        subjectId: "minsu",
        fact: { relation: "beside", refIds: ["eunhaeng"] },
      },
      {
        scene: street,
        subjectId: "minsu",
        fact: { relation: "front", refIds: ["hakgyo"] },
      },
      {
        scene: street,
        subjectId: "minsu",
        fact: { relation: "behind", refIds: ["eunhaeng"] },
      },
      {
        scene: street,
        subjectId: "minsu",
        fact: { relation: "near", refIds: ["hakgyo"] },
      },
      {
        scene: street,
        subjectId: "minsu",
        fact: { relation: "between", refIds: ["hakgyo", "eunhaeng"] },
      },
      {
        scene: street,
        subjectId: "minsu",
        fact: { relation: "outside", refIds: ["yakguk"] },
      },
      {
        scene: cut,
        subjectId: "yuna",
        fact: { relation: "above", refIds: ["gyosil"] },
      },
      {
        scene: cut,
        subjectId: "yuna",
        fact: { relation: "below", refIds: ["doseogwan"] },
      },
      {
        scene: cut,
        subjectId: "yuna",
        fact: { relation: "inside", refIds: ["samusil"] },
      },
      {
        scene: cut,
        subjectId: "yuna",
        fact: { relation: "outside", refIds: ["hwajangsil"] },
      },
      {
        scene: cut,
        subjectId: "yuna",
        fact: { relation: "near", refIds: ["samusil"] },
      },
    ];

    const covered = new Set<SpatialRelation>();

    for (const item of cases) {
      const cell = resolveTargetCell(item.scene, item.subjectId, item.fact);
      expect(cell, JSON.stringify(item.fact)).not.toBeNull();
      if (!cell) {
        continue;
      }
      const next = applyCell(item.scene, item.subjectId, cell);
      expect(holds(next, item.subjectId, item.fact)).toBe(true);
      covered.add(item.fact.relation);
    }

    const allRelations: SpatialRelation[] = [
      "front",
      "behind",
      "beside",
      "left",
      "right",
      "above",
      "below",
      "inside",
      "outside",
      "between",
      "near",
    ];
    for (const relation of allRelations) {
      expect(covered.has(relation)).toBe(true);
    }
  });

  it("does not place beside into an adjacent building on street", () => {
    const scene: Scene = {
      id: "adjacent-buildings",
      kind: "street",
      cols: 6,
      rows: 3,
      entities: [
        {
          id: "hakgyo",
          kind: "building",
          sprite: "school",
          ko: "학교",
          ru: "школа",
          col: 0,
          row: 1,
          w: 2,
          h: 1,
        },
        {
          id: "eunhaeng",
          kind: "building",
          sprite: "bank",
          ko: "은행",
          ru: "банк",
          col: 2,
          row: 1,
          w: 2,
          h: 1,
        },
        {
          id: "minsu",
          kind: "person",
          sprite: "person",
          ko: "민수",
          ru: "Минсу",
          col: 5,
          row: 1,
          movable: true,
        },
      ],
    };

    expect(
      resolveTargetCell(scene, "minsu", {
        relation: "beside",
        refIds: ["hakgyo"],
      }),
    ).toBeNull();
  });

  it("never returns a cell occupied by another person", () => {
    const scene: Scene = {
      id: "two-persons",
      kind: "classroom",
      cols: 5,
      rows: 3,
      entities: [
        {
          id: "chaeksang",
          kind: "object",
          sprite: "desk",
          ko: "책상",
          ru: "парта",
          col: 2,
          row: 1,
        },
        {
          id: "minsu",
          kind: "person",
          sprite: "person",
          ko: "민수",
          ru: "Минсу",
          col: 0,
          row: 1,
          movable: true,
        },
        {
          id: "yuna",
          kind: "person",
          sprite: "person-2",
          ko: "유나",
          ru: "Юна",
          col: 1,
          row: 1,
          movable: true,
        },
      ],
    };

    const cell = resolveTargetCell(scene, "minsu", {
      relation: "beside",
      refIds: ["chaeksang"],
    });
    expect(cell).not.toBeNull();
    expect(cell).toEqual({ col: 3, row: 1 });
    expect(cell).not.toEqual({ col: 1, row: 1 });

    const near = resolveTargetCell(scene, "minsu", {
      relation: "near",
      refIds: ["chaeksang"],
    });
    expect(near).not.toBeNull();
    if (near) {
      expect(near.col === 1 && near.row === 1).toBe(false);
    }
  });
});
