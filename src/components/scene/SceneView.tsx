"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { PixelSceneCanvas } from "@/components/scene/PixelSceneCanvas";
import { SceneCanvas } from "@/components/scene/SceneCanvas";
import {
  DEFAULT_SKIN,
  SKIN_STORAGE_KEY,
  isSkinId,
  type SkinId,
} from "@/lib/scene/skin";
import { getPixelSkin } from "@/lib/scene/skins";
import { checkCozyAvailable, setCozyAvailable } from "@/lib/scene/skins/cozy";
import type { Scene } from "@/lib/scene/types";

type SceneViewProps = {
  scene: Scene;
  skinId?: SkinId;
  highlightId?: string;
  className?: string;
};

function readStoredSkin(): SkinId {
  if (process.env.NODE_ENV !== "development") return DEFAULT_SKIN;
  if (typeof window === "undefined") return "svg";
  try {
    const stored = window.localStorage.getItem(SKIN_STORAGE_KEY);
    if (stored && isSkinId(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "svg";
}

function subscribeSkin(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === SKIN_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("scene-skin-change", onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("scene-skin-change", onChange);
  };
}

export function useSceneSkin(override?: SkinId): SkinId {
  const stored = useSyncExternalStore(
    subscribeSkin,
    readStoredSkin,
    () => (process.env.NODE_ENV === "production" ? DEFAULT_SKIN : "svg"),
  );
  return override ?? stored;
}

export function setSceneSkin(id: SkinId): void {
  try {
    window.localStorage.setItem(SKIN_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("scene-skin-change"));
}

export function SceneView({
  scene,
  skinId: skinOverride,
  highlightId,
  className,
}: SceneViewProps) {
  const skinId = useSceneSkin(skinOverride);
  const [cozyOk, setCozyOk] = useState(true);

  useEffect(() => {
    if (skinId !== "cozy") return;
    let cancelled = false;
    void checkCozyAvailable().then((ok) => {
      if (cancelled) return;
      setCozyAvailable(ok);
      setCozyOk(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [skinId]);

  if (skinId === "svg") {
    return (
      <SceneCanvas
        scene={scene}
        highlightId={highlightId}
        className={className}
      />
    );
  }

  const skin = getPixelSkin(skinId);
  if (skinId === "cozy" && !cozyOk) {
    return (
      <div
        className={`flex min-h-48 items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel-solid)] p-6 text-center text-sm text-[var(--ink-soft)] ${className ?? ""}`}
      >
        Скин «{skin.titleRu}»: ассеты не установлены
        <br />
        <span className="mt-1 block text-xs opacity-80">
          Ожидается папка public/assets-restricted/
        </span>
      </div>
    );
  }

  return (
    <PixelSceneCanvas
      scene={scene}
      skin={skin}
      highlightId={highlightId}
      className={className}
    />
  );
}
