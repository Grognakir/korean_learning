import type { SceneKind, SpriteId } from "@/lib/scene/types";

export type Direction = "down" | "up" | "left" | "right";

export type SpriteRef = {
  sheet: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PersonSprite = {
  sheet: string;
  frameW: number;
  frameH: number;
  idle: Record<Direction, SpriteRef>;
  walk: Record<Direction, SpriteRef[]>;
};

export type BackgroundBand = {
  /** Inclusive start row (scene grid). */
  fromRow: number;
  /** Exclusive end row. */
  toRow: number;
  color?: string;
  tile?: SpriteRef;
};

export type BackgroundSpec = {
  /** Base fill behind everything. */
  fill: string;
  bands?: BackgroundBand[];
};

export type Skin = {
  id: string;
  titleRu: string;
  resolve(spriteId: SpriteId): SpriteRef | null;
  person(spriteId: "person" | "person-2"): PersonSprite | null;
  background(kind: SceneKind): BackgroundSpec;
  available(): boolean;
};

export type SkinId = "cc0" | "cozy" | "lpc" | "svg";

export const DEFAULT_SKIN: SkinId = "cc0";
export const SKIN_STORAGE_KEY = "scene-skin";

export function isSkinId(value: string): value is SkinId {
  return value === "cc0" || value === "cozy" || value === "lpc" || value === "svg";
}
