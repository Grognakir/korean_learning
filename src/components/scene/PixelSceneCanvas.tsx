"use client";

import type { ReactNode } from "react";
import { Sprite } from "@/components/scene/sprites";
import type { BackgroundSpec, PersonSprite, Skin, SpriteRef } from "@/lib/scene/skin";
import type { Scene, SceneEntity } from "@/lib/scene/types";

type PixelSceneCanvasProps = {
  scene: Scene;
  skin: Skin;
  highlightId?: string;
  className?: string;
};

function entityW(entity: SceneEntity): number {
  return entity.w ?? 1;
}

function entityH(entity: SceneEntity): number {
  return entity.h ?? 1;
}

function kindOrder(kind: SceneEntity["kind"]): number {
  switch (kind) {
    case "building":
      return 0;
    case "room":
      return 1;
    case "decor":
      return 2;
    case "object":
      return 3;
    case "person":
      return 4;
    default:
      return 5;
  }
}

/** Clip a frame from an atlas sheet and scale it into the parent box. */
function ClippedSprite({
  sprite,
  fit = "contain",
}: {
  sprite: SpriteRef;
  fit?: "contain" | "cover";
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={encodeURI(sprite.sheet)}
        alt=""
        draggable={false}
        className="absolute left-0 top-0 max-w-none"
        style={{ imageRendering: "pixelated" }}
        ref={(img) => {
          if (!img) return;
          const layout = () => {
            const parent = img.parentElement;
            if (!parent || !img.naturalWidth) return;
            const pw = parent.clientWidth;
            const ph = parent.clientHeight;
            if (pw === 0 || ph === 0) return;
            const scale =
              fit === "cover"
                ? Math.max(pw / sprite.w, ph / sprite.h)
                : Math.min(pw / sprite.w, ph / sprite.h);
            img.style.width = `${img.naturalWidth * scale}px`;
            img.style.height = `${img.naturalHeight * scale}px`;
            img.style.left = `${-sprite.x * scale + (pw - sprite.w * scale) / 2}px`;
            img.style.top = `${-sprite.y * scale + (ph - sprite.h * scale) / 2}px`;
          };
          if (img.complete) layout();
          img.onload = layout;
        }}
      />
    </div>
  );
}

function TileBackground({
  cols,
  rows,
  spec,
}: {
  cols: number;
  rows: number;
  spec: BackgroundSpec;
}) {
  const cells: ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    const band = spec.bands?.find((b) => row >= b.fromRow && row < b.toRow);
    for (let col = 0; col < cols; col++) {
      const key = `${row}-${col}`;
      const left = `${(col / cols) * 100}%`;
      const top = `${(row / rows) * 100}%`;
      const width = `${(1 / cols) * 100}%`;
      const height = `${(1 / rows) * 100}%`;
      if (band?.tile) {
        cells.push(
          <div
            key={key}
            className="absolute overflow-hidden"
            style={{ left, top, width, height }}
          >
            <ClippedSprite sprite={band.tile} fit="cover" />
          </div>,
        );
      } else if (band?.color) {
        cells.push(
          <div
            key={key}
            className="absolute"
            style={{ left, top, width, height, background: band.color }}
          />,
        );
      }
    }
  }
  return <>{cells}</>;
}

function PersonFrame({ person }: { person: PersonSprite }) {
  return <ClippedSprite sprite={person.idle.down} fit="contain" />;
}

function SvgFallback({ entity }: { entity: SceneEntity }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <Sprite id={entity.sprite} />
    </svg>
  );
}

export function PixelSceneCanvas({
  scene,
  skin,
  highlightId,
  className,
}: PixelSceneCanvasProps) {
  if (!skin.available()) {
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

  const entities = [...scene.entities].sort(
    (a, b) =>
      kindOrder(a.kind) - kindOrder(b.kind) || a.row - b.row || a.col - b.col,
  );
  const bg = skin.background(scene.kind);
  const { cols, rows } = scene;

  return (
    <div
      role="img"
      aria-label={scene.id}
      className={`relative w-full overflow-visible ${className ?? ""}`}
      style={{
        aspectRatio: `${cols} / ${rows}`,
        background: bg.fill,
      }}
    >
      <TileBackground cols={cols} rows={rows} spec={bg} />
      {entities.map((entity) => {
        const w = entityW(entity);
        const h = entityH(entity);
        const highlighted = highlightId === entity.id;
        const isPerson =
          entity.sprite === "person" || entity.sprite === "person-2";
        const person = isPerson
          ? skin.person(entity.sprite as "person" | "person-2")
          : null;
        const resolved = isPerson ? null : skin.resolve(entity.sprite);

        return (
          <div
            key={entity.id}
            className="absolute"
            style={{
              left: `${(entity.col / cols) * 100}%`,
              top: `${(entity.row / rows) * 100}%`,
              width: `${(w / cols) * 100}%`,
              height: `${(h / rows) * 100}%`,
              transition: "left 700ms ease-in-out, top 700ms ease-in-out",
              zIndex: kindOrder(entity.kind) + 1,
            }}
          >
            {highlighted ? (
              <div
                className="scene-pixel-marker pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 text-[var(--accent-2)]"
                aria-hidden
              >
                ▼
              </div>
            ) : null}
            <div className="relative h-[88%] w-full">
              {person ? (
                <PersonFrame person={person} />
              ) : resolved ? (
                <ClippedSprite sprite={resolved} fit="contain" />
              ) : (
                <SvgFallback entity={entity} />
              )}
            </div>
            {entity.kind !== "decor" ? (
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 truncate text-center text-[11px] leading-none text-[var(--ink)] sm:text-[13px]"
                style={{ fontFamily: "var(--font-pixel), monospace" }}
              >
                {entity.ko}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
