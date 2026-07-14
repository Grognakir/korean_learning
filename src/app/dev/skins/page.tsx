"use client";

// dev-витрина: сравнение скинов на всех сценах темы «위치»

import { useMemo, useState } from "react";
import { SceneView } from "@/components/scene/SceneView";
import { scenes } from "@/content/topics/location";
import type { SkinId } from "@/lib/scene/skin";

const SKINS: { id: SkinId; title: string; license: string }[] = [
  { id: "cc0", title: "cc0", license: "Kenney + Ninja Adventure (CC0)" },
  {
    id: "cozy",
    title: "cozy",
    license: "Sprout Lands + LimeZu (локально, не в git)",
  },
  { id: "lpc", title: "lpc", license: "LPC tiles/characters (CC-BY-SA)" },
  { id: "svg", title: "svg", license: "Встроенные SVG-спрайты" },
];

export default function SkinsPage() {
  const [skinId, setSkinId] = useState<SkinId>("cc0");
  const active = useMemo(
    () => SKINS.find((s) => s.id === skinId) ?? SKINS[0],
    [skinId],
  );

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-semibold">Скины сцен</h1>
        <p className="text-sm text-[var(--ink-soft)]">
          Сравнение рендера всех сцен темы. Активный скин:{" "}
          <strong>{active.title}</strong> — {active.license}
        </p>
        <div className="flex flex-wrap gap-2">
          {SKINS.map((skin) => (
            <button
              key={skin.id}
              type="button"
              onClick={() => setSkinId(skin.id)}
              className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
                skinId === skin.id
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--line)] bg-white/80"
              }`}
            >
              {skin.title}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-8">
        {scenes.map((scene) => (
          <section key={scene.id} className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
              {scene.id} · {scene.kind} · {scene.cols}×{scene.rows}
            </h2>
            <div className="panel overflow-hidden rounded-2xl p-3">
              <SceneView scene={scene} skinId={skinId} className="rounded-xl" />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
