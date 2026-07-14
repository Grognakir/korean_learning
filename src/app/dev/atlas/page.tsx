"use client";

// dev-витрина: атлас-инспектор для подбора координат SpriteRef

import {
  useCallback,
  useMemo,
  useState,
  Suspense,
  type MouseEvent,
} from "react";
import { useSearchParams } from "next/navigation";

const PRESETS = [
  "/assets/ninja-adventure/tilesets/TilesetHouse.png",
  "/assets/ninja-adventure/characters/Boy/SeparateAnim/Walk.png",
  "/assets/ninja-adventure/characters/Boy/SeparateAnim/Idle.png",
  "/assets/kenney-tiny-town/Tilemap/tilemap_packed.png",
  "/assets/lpc/tiles/house.png",
  "/assets/lpc/characters/male/universal.png",
  "/assets-restricted/sprout-lands/Characters/Basic Charakter Spritesheet.png",
  "/assets-restricted/limezu/Characters_free/Adam_idle_16x16.png",
  "/assets-restricted/limezu/Characters_free/Adam_run_16x16.png",
];

function AtlasInspector() {
  const params = useSearchParams();
  const initialSheet = params.get("sheet") ?? PRESETS[0];
  const initialGrid = Number(params.get("grid") ?? "16") || 16;

  const [sheet, setSheet] = useState(initialSheet);
  const [grid, setGrid] = useState(initialGrid);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<{ col: number; row: number } | null>(null);
  const [picked, setPicked] = useState<{
    col: number;
    row: number;
    x: number;
    y: number;
  } | null>(null);
  const [zoom, setZoom] = useState(3);
  const [error, setError] = useState<string | null>(null);

  const cols = natural.w > 0 ? Math.floor(natural.w / grid) : 0;
  const rows = natural.h > 0 ? Math.floor(natural.h / grid) : 0;

  const onMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / zoom;
      const y = (event.clientY - rect.top) / zoom;
      const col = Math.floor(x / grid);
      const row = Math.floor(y / grid);
      if (col < 0 || row < 0 || col >= cols || row >= rows) {
        setHover(null);
        return;
      }
      setHover({ col, row });
    },
    [cols, rows, grid, zoom],
  );

  const onClick = useCallback(() => {
    if (!hover) return;
    const next = {
      col: hover.col,
      row: hover.row,
      x: hover.col * grid,
      y: hover.row * grid,
    };
    setPicked(next);
    const line = `{ sheet: "${sheet}", x: ${next.x}, y: ${next.y}, w: ${grid}, h: ${grid} }`;
    console.log("[atlas]", line);
    void navigator.clipboard?.writeText(line).catch(() => undefined);
  }, [hover, grid, sheet]);

  const gridLines = useMemo(() => {
    if (!natural.w) return null;
    return (
      <svg
        className="pointer-events-none absolute inset-0"
        width={natural.w * zoom}
        height={natural.h * zoom}
      >
        {Array.from({ length: cols + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * grid * zoom}
            y1={0}
            x2={i * grid * zoom}
            y2={natural.h * zoom}
            stroke="rgba(255,40,40,0.35)"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: rows + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * grid * zoom}
            x2={natural.w * zoom}
            y2={i * grid * zoom}
            stroke="rgba(255,40,40,0.35)"
            strokeWidth={1}
          />
        ))}
        {hover ? (
          <rect
            x={hover.col * grid * zoom}
            y={hover.row * grid * zoom}
            width={grid * zoom}
            height={grid * zoom}
            fill="rgba(255,220,0,0.25)"
            stroke="#f59e0b"
            strokeWidth={2}
          />
        ) : null}
      </svg>
    );
  }, [natural, zoom, cols, rows, grid, hover]);

  return (
    <main className="mx-auto max-w-[1200px] space-y-4 px-4 py-8">
      <h1 className="font-display text-2xl font-semibold">Atlas inspector</h1>
      <p className="text-sm text-[var(--ink-soft)]">
        Клик по клетке копирует SpriteRef в буфер и пишет в консоль.
      </p>

      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          sheet
          <input
            className="min-w-[28rem] rounded-lg border border-[var(--line)] bg-white px-2 py-1"
            value={sheet}
            onChange={(event) => {
              setSheet(event.target.value);
              setError(null);
              setPicked(null);
            }}
          />
        </label>
        <label className="flex items-center gap-2">
          grid
          <input
            type="number"
            min={4}
            max={128}
            className="w-20 rounded-lg border border-[var(--line)] bg-white px-2 py-1"
            value={grid}
            onChange={(event) => setGrid(Number(event.target.value) || 16)}
          />
        </label>
        <label className="flex items-center gap-2">
          zoom
          <input
            type="range"
            min={1}
            max={8}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <span>{zoom}×</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="rounded-lg border border-[var(--line)] bg-white/80 px-2 py-1 text-xs"
            onClick={() => {
              setSheet(preset);
              setError(null);
            }}
          >
            {preset.split("/").slice(-2).join("/")}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-[var(--bad)] bg-red-50 px-3 py-2 text-sm text-[var(--bad)]">
          {error}
        </p>
      ) : null}

      <div className="panel rounded-xl p-3 text-sm">
        <div>
          size: {natural.w}×{natural.h} · cells: {cols}×{rows} · grid {grid}px
        </div>
        {hover ? (
          <div>
            hover cell ({hover.col}, {hover.row}) → x={hover.col * grid}, y=
            {hover.row * grid}
          </div>
        ) : null}
        {picked ? (
          <code className="mt-1 block break-all text-xs">
            {`{ sheet: "${sheet}", x: ${picked.x}, y: ${picked.y}, w: ${grid}, h: ${grid} }`}
          </code>
        ) : null}
      </div>

      <div className="overflow-auto rounded-xl border border-[var(--line)] bg-[#1a1a1a] p-3">
        <div
          className="relative inline-block cursor-crosshair"
          style={{ width: natural.w * zoom, height: natural.h * zoom }}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          onClick={onClick}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sheet}
            alt="atlas"
            className="absolute left-0 top-0 max-w-none"
            style={{
              width: natural.w * zoom || undefined,
              height: natural.h * zoom || undefined,
              imageRendering: "pixelated",
            }}
            onLoad={(event) => {
              setNatural({
                w: event.currentTarget.naturalWidth,
                h: event.currentTarget.naturalHeight,
              });
              setError(null);
            }}
            onError={() => {
              setNatural({ w: 0, h: 0 });
              setError(`Не удалось загрузить: ${sheet}`);
            }}
          />
          {gridLines}
        </div>
      </div>
    </main>
  );
}

export default function AtlasPage() {
  return (
    <Suspense fallback={<main className="p-8 text-sm">Загрузка…</main>}>
      <AtlasInspector />
    </Suspense>
  );
}
