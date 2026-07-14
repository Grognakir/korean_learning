"use client";

import { Sprite } from "@/components/scene/sprites";
import type { Scene, SceneEntity, SceneKind } from "@/lib/scene/types";

const CELL = 100;

type SceneCanvasProps = {
  scene: Scene;
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

function SceneBackground({
  kind,
  cols,
  rows,
}: {
  kind: SceneKind;
  cols: number;
  rows: number;
}) {
  const width = cols * CELL;
  const height = rows * CELL;

  if (kind === "street") {
    const skyH = Math.max(CELL, (rows - 1) * CELL * 0.45);
    const groundY = skyH;
    const roadY = height - CELL;
    return (
      <g>
        <rect x={0} y={0} width={width} height={skyH} fill="#cfe0f0" />
        <rect x={0} y={groundY} width={width} height={height - groundY} fill="#d9e5e0" />
        <rect x={0} y={roadY} width={width} height={CELL} fill="#6a6a6a" />
        <rect x={CELL * 0.2} y={roadY + CELL * 0.45} width={CELL * 0.4} height={6} fill="#f5f0a8" />
        <rect x={CELL * 1.2} y={roadY + CELL * 0.45} width={CELL * 0.4} height={6} fill="#f5f0a8" />
        <rect x={CELL * 2.2} y={roadY + CELL * 0.45} width={CELL * 0.4} height={6} fill="#f5f0a8" />
        <rect x={CELL * 3.2} y={roadY + CELL * 0.45} width={CELL * 0.4} height={6} fill="#f5f0a8" />
        <rect x={CELL * 4.2} y={roadY + CELL * 0.45} width={CELL * 0.4} height={6} fill="#f5f0a8" />
      </g>
    );
  }

  if (kind === "building-cut") {
    return (
      <g>
        <rect x={0} y={0} width={width} height={height} fill="#eef3f1" />
        <rect
          x={4}
          y={4}
          width={width - 8}
          height={height - 8}
          fill="#fff6eb"
          stroke="var(--ink-soft)"
          strokeWidth={4}
          rx={8}
        />
        {Array.from({ length: rows - 1 }, (_, index) => {
          const y = (index + 1) * CELL;
          return (
            <line
              key={y}
              x1={4}
              y1={y}
              x2={width - 4}
              y2={y}
              stroke="var(--ink-soft)"
              strokeWidth={2}
              strokeDasharray="8 6"
              opacity={0.45}
            />
          );
        })}
      </g>
    );
  }

  return (
    <g>
      <rect x={0} y={0} width={width} height={height * 0.35} fill="#e8dfd0" />
      <rect x={0} y={height * 0.35} width={width} height={height * 0.65} fill="#f4efe6" />
      <line
        x1={0}
        y1={height * 0.35}
        x2={width}
        y2={height * 0.35}
        stroke="var(--line)"
        strokeWidth={3}
      />
    </g>
  );
}

export function SceneCanvas({ scene, highlightId, className }: SceneCanvasProps) {
  const width = scene.cols * CELL;
  const height = scene.rows * CELL;
  const entities = [...scene.entities].sort(
    (a, b) => kindOrder(a.kind) - kindOrder(b.kind) || a.row - b.row || a.col - b.col,
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={scene.id}
      className={className}
      style={{ display: "block", overflow: "visible" }}
    >
      <SceneBackground kind={scene.kind} cols={scene.cols} rows={scene.rows} />
      {entities.map((entity) => {
        const w = entityW(entity);
        const h = entityH(entity);
        const x = entity.col * CELL;
        const y = entity.row * CELL;
        const highlighted = highlightId === entity.id;

        return (
          <g
            key={entity.id}
            style={{
              transform: `translate(${x}px, ${y}px)`,
              transition: "transform 700ms ease-in-out",
            }}
          >
            {highlighted ? (
              <ellipse
                className="scene-highlight-ring"
                cx={(w * CELL) / 2}
                cy={(h * CELL) / 2}
                rx={(w * CELL) / 2 - 4}
                ry={(h * CELL) / 2 - 4}
                fill="var(--accent)"
              />
            ) : null}
            <g transform={`scale(${w}, ${h})`}>
              <Sprite id={entity.sprite} />
            </g>
            {entity.kind !== "decor" ? (
              <text
                className="ko-text"
                x={(w * CELL) / 2}
                y={h * CELL + 18}
                textAnchor="middle"
                fontSize={14}
                fill="var(--ink)"
              >
                {entity.ko}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
