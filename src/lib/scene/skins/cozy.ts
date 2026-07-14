import type {
  BackgroundSpec,
  Direction,
  PersonSprite,
  Skin,
  SpriteRef,
} from "@/lib/scene/skin";
import type { SceneKind, SpriteId } from "@/lib/scene/types";

const SPROUT = "/assets-restricted/sprout-lands";
const LIMEZU = "/assets-restricted/limezu";

function sprout(
  path: string,
  x: number,
  y: number,
  w: number,
  h: number,
): SpriteRef {
  return { sheet: `${SPROUT}/${path}`, x, y, w, h };
}

function limezu(
  path: string,
  x: number,
  y: number,
  w: number,
  h: number,
): SpriteRef {
  return { sheet: `${LIMEZU}/${path}`, x, y, w, h };
}

const DIRS: Direction[] = ["down", "up", "left", "right"];

/**
 * Sprout Lands Basic Character Spritesheet 192×192 = 4×4 of 48×48.
 * Rows: down, up, right, left. Col 0–1 idle-ish, col 2–3 walk.
 */
function sproutPerson(): PersonSprite {
  const sheet = `${SPROUT}/Characters/Basic Charakter Spritesheet.png`;
  const rowOf: Record<Direction, number> = {
    down: 0,
    up: 1,
    right: 2,
    left: 3,
  };
  const idle = {} as PersonSprite["idle"];
  const walk = {} as PersonSprite["walk"];
  for (const dir of DIRS) {
    const y = rowOf[dir] * 48;
    idle[dir] = { sheet, x: 0, y, w: 48, h: 48 };
    walk[dir] = [
      { sheet, x: 0, y, w: 48, h: 48 },
      { sheet, x: 96, y, w: 48, h: 48 },
      { sheet, x: 48, y, w: 48, h: 48 },
      { sheet, x: 144, y, w: 48, h: 48 },
    ];
  }
  return { sheet, frameW: 48, frameH: 48, idle, walk };
}

/**
 * LimeZu Adam_idle: 64×32 → 4×2 of 16×16. Row0 = left, up, right, down.
 * Adam_run: 384×32 → 24×2 of 16×16; 6 frames × left/up/right/down.
 */
function adamPerson(): PersonSprite {
  const idleSheet = `${LIMEZU}/Characters_free/Adam_idle_16x16.png`;
  const runSheet = `${LIMEZU}/Characters_free/Adam_run_16x16.png`;
  const idleOrder: Direction[] = ["left", "up", "right", "down"];
  const idle = {} as PersonSprite["idle"];
  const walk = {} as PersonSprite["walk"];
  for (let i = 0; i < 4; i++) {
    const dir = idleOrder[i];
    idle[dir] = { sheet: idleSheet, x: i * 16, y: 0, w: 16, h: 16 };
  }
  for (let di = 0; di < 4; di++) {
    const dir = idleOrder[di];
    walk[dir] = [];
    for (let f = 0; f < 6; f++) {
      walk[dir].push({
        sheet: runSheet,
        x: (di * 6 + f) * 16,
        y: 0,
        w: 16,
        h: 16,
      });
    }
  }
  return { sheet: runSheet, frameW: 16, frameH: 16, idle, walk };
}

const STREET: Partial<Record<SpriteId, SpriteRef>> = {
  bank: sprout("Tilesets/Wooden House.png", 0, 0, 48, 64),
  pharmacy: sprout("Tilesets/Wooden House.png", 48, 0, 48, 64),
  bookstore: sprout("Tilesets/Wooden House.png", 16, 16, 48, 48),
  cafe: sprout("Tilesets/Wooden House.png", 64, 16, 48, 48),
  convenience: sprout("Tilesets/Doors.png", 0, 0, 32, 48),
  restaurant: sprout("Tilesets/Wooden House.png", 0, 16, 48, 64),
  school: sprout("Tilesets/Wooden House.png", 32, 0, 48, 64),
  hospital: sprout("Tilesets/Wooden House.png", 0, 0, 48, 64),
  house: sprout("Tilesets/Wooden House.png", 48, 16, 48, 48),
  office: sprout("Tilesets/Wooden House.png", 16, 0, 48, 64),
  library: sprout("Objects/Basic Furniture.png", 0, 48, 32, 32),
  toilet: sprout("Tilesets/Doors.png", 16, 0, 16, 32),
  tree: sprout("Objects/Basic_Grass_Biom_things.png", 0, 0, 32, 32),
  road: sprout("Tilesets/Tilled Dirt.png", 16, 16, 16, 16),
};

const INTERIOR: Partial<Record<SpriteId, SpriteRef>> = {
  desk: limezu("Interiors_free/16x16/Interiors_free_16x16.png", 0, 64, 32, 16),
  table: limezu("Interiors_free/16x16/Interiors_free_16x16.png", 32, 64, 32, 16),
  chair: limezu("Interiors_free/16x16/Interiors_free_16x16.png", 64, 64, 16, 16),
  door: limezu("Interiors_free/16x16/Room_Builder_free_16x16.png", 0, 48, 16, 32),
  computer: limezu("Interiors_free/16x16/Interiors_free_16x16.png", 96, 32, 16, 16),
  bag: limezu("Interiors_free/16x16/Interiors_free_16x16.png", 112, 48, 16, 16),
  book: limezu("Interiors_free/16x16/Interiors_free_16x16.png", 128, 32, 16, 16),
  bed: sprout("Objects/Basic Furniture.png", 0, 16, 32, 32),
  sofa: sprout("Objects/Basic Furniture.png", 48, 48, 32, 16),
  clock: sprout("Objects/Basic Furniture.png", 96, 48, 16, 16),
  window: limezu("Interiors_free/16x16/Room_Builder_free_16x16.png", 48, 0, 16, 16),
  blackboard: limezu("Interiors_free/16x16/Interiors_free_16x16.png", 0, 0, 48, 32),
  room: limezu("Interiors_free/16x16/Room_Builder_free_16x16.png", 16, 80, 16, 16),
};

let availableCache: boolean | null = null;

async function probeRestricted(): Promise<boolean> {
  try {
    const res = await fetch(
      `${SPROUT}/Characters/Basic%20Charakter%20Spritesheet.png`,
      { method: "HEAD" },
    );
    return res.ok;
  } catch {
    return false;
  }
}

function background(kind: SceneKind): BackgroundSpec {
  const grass = sprout("Tilesets/Grass.png", 16, 16, 16, 16);
  const dirt = sprout("Tilesets/Tilled Dirt.png", 16, 16, 16, 16);
  const floor = limezu(
    "Interiors_free/16x16/Room_Builder_free_16x16.png",
    16,
    80,
    16,
    16,
  );
  const wood = limezu(
    "Interiors_free/16x16/Room_Builder_free_16x16.png",
    48,
    80,
    16,
    16,
  );

  if (kind === "street") {
    return {
      fill: "#87b8e0",
      bands: [
        { fromRow: 0, toRow: 1, color: "#87b8e0" },
        { fromRow: 1, toRow: 2, tile: grass },
        { fromRow: 2, toRow: 99, tile: dirt },
      ],
    };
  }
  if (kind === "building-cut") {
    return {
      fill: "#f5e6d3",
      bands: [{ fromRow: 0, toRow: 99, tile: wood }],
    };
  }
  return {
    fill: "#efe4d2",
    bands: [{ fromRow: 0, toRow: 99, tile: floor }],
  };
}

export const cozySkin: Skin = {
  id: "cozy",
  titleRu: "Cozy (Sprout + LimeZu)",
  resolve(spriteId) {
    return STREET[spriteId] ?? INTERIOR[spriteId] ?? null;
  },
  person(spriteId) {
    // Street people: Sprout; indoor people: Adam (LimeZu).
    // Prefer Adam for person-2 variety; Sprout for person.
    return spriteId === "person-2" ? adamPerson() : sproutPerson();
  },
  background,
  available() {
    // SceneView probes via checkCozyAvailable and may set false when missing.
    if (availableCache === false) return false;
    return true;
  },
};

/** Force an availability check (for UI). */
export async function checkCozyAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  availableCache = await probeRestricted();
  return availableCache;
}

export function setCozyAvailable(value: boolean): void {
  availableCache = value;
}
