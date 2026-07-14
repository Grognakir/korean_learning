"use client";

// dev-витрина, удалить в TASK-07

import { useState } from "react";
import { SceneCanvas } from "@/components/scene/SceneCanvas";
import type { Scene, SceneEntity } from "@/lib/scene/types";

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

function movePerson(scene: Scene, personId: string, delta: number): Scene {
  return {
    ...scene,
    entities: scene.entities.map((entity) => {
      if (entity.id !== personId) {
        return entity;
      }
      const w = entity.w ?? 1;
      const nextCol = Math.max(0, Math.min(scene.cols - w, entity.col + delta));
      const next: SceneEntity = { ...entity, col: nextCol };
      return next;
    }),
  };
}

export default function DevScenePage() {
  const [street, setStreet] = useState(streetScene);
  const [cut, setCut] = useState(buildingCutScene);

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-[var(--accent)]">dev / scene</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
          Витрина сцен
        </h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Проверка спрайтов, фона и плавного перемещения персонажа.
        </p>
      </header>

      <section className="panel space-y-4 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Улица</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
              onClick={() => setStreet((prev) => movePerson(prev, "minsu", -1))}
            >
              ← Минсу
            </button>
            <button
              type="button"
              className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
              onClick={() => setStreet((prev) => movePerson(prev, "minsu", 1))}
            >
              Минсу →
            </button>
          </div>
        </div>
        <SceneCanvas scene={street} highlightId="minsu" className="rounded-xl" />
      </section>

      <section className="panel space-y-4 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Разрез здания</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
              onClick={() => setCut((prev) => movePerson(prev, "yuna", -1))}
            >
              ← Юна
            </button>
            <button
              type="button"
              className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
              onClick={() => setCut((prev) => movePerson(prev, "yuna", 1))}
            >
              Юна →
            </button>
          </div>
        </div>
        <SceneCanvas scene={cut} highlightId="yuna" className="rounded-xl" />
      </section>
    </main>
  );
}
