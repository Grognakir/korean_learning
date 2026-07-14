"use client";

import { setSceneSkin, useSceneSkin } from "@/components/scene/SceneView";
import type { SkinId } from "@/lib/scene/skin";

const OPTIONS: { id: SkinId; label: string }[] = [
  { id: "cc0", label: "cc0" },
  { id: "cozy", label: "cozy" },
  { id: "lpc", label: "lpc" },
  { id: "svg", label: "svg" },
];

export function SkinSwitcher() {
  const skinId = useSceneSkin();

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-[var(--line)] bg-[var(--panel-solid)] p-2 shadow-lg">
      <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        Скин (dev)
      </p>
      <div className="flex flex-wrap gap-1">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSceneSkin(option.id)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              skinId === option.id
                ? "bg-[var(--accent)] text-white"
                : "bg-white/80 text-[var(--ink)] hover:border-[var(--accent)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
