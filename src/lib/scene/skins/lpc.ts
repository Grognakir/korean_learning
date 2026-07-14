import type {
  BackgroundSpec,
  Direction,
  PersonSprite,
  Skin,
  SpriteRef,
} from "@/lib/scene/skin";
import type { SceneKind, SpriteId } from "@/lib/scene/types";

function lpcTile(
  name: string,
  x: number,
  y: number,
  w = 32,
  h = 32,
): SpriteRef {
  return { sheet: `/assets/lpc/tiles/${name}.png`, x, y, w, h };
}

const DIRS: Direction[] = ["down", "up", "left", "right"];

/**
 * LPC universal sheet (64×64): walk cycle rows 8–11 = up, left, down, right.
 * These packs are headless bases — still usable silhouettes for the lpc skin.
 */
function lpcPerson(body: "male" | "female"): PersonSprite {
  const sheet = `/assets/lpc/characters/${body}/universal.png`;
  const rowOf: Record<Direction, number> = {
    up: 8,
    left: 9,
    down: 10,
    right: 11,
  };
  const idle = {} as PersonSprite["idle"];
  const walk = {} as PersonSprite["walk"];
  for (const dir of DIRS) {
    const y = rowOf[dir] * 64;
    idle[dir] = { sheet, x: 0, y, w: 64, h: 64 };
    walk[dir] = [];
    for (let f = 0; f < 9; f++) {
      walk[dir].push({ sheet, x: f * 64, y, w: 64, h: 64 });
    }
  }
  return { sheet, frameW: 64, frameH: 64, idle, walk };
}

const SPRITES: Partial<Record<SpriteId, SpriteRef>> = {
  bank: lpcTile("house", 0, 0, 96, 96),
  pharmacy: lpcTile("house", 96, 0, 64, 96),
  bookstore: lpcTile("victoria", 0, 0, 64, 96),
  cafe: lpcTile("victoria", 64, 0, 64, 96),
  convenience: lpcTile("house", 160, 0, 64, 96),
  restaurant: lpcTile("victoria", 128, 0, 64, 96),
  school: lpcTile("house", 0, 96, 96, 96),
  hospital: lpcTile("house", 96, 96, 64, 96),
  house: lpcTile("house", 160, 96, 64, 96),
  office: lpcTile("victoria", 192, 0, 64, 96),
  library: lpcTile("cabinets", 0, 0, 64, 64),
  toilet: lpcTile("inside", 64, 64, 32, 32),

  tree: lpcTile("treetop", 0, 0, 64, 64),
  road: lpcTile("dirt", 0, 0, 32, 32),

  desk: lpcTile("cabinets", 0, 64, 64, 48),
  table: lpcTile("kitchen", 0, 0, 32, 32),
  chair: lpcTile("inside", 0, 96, 32, 32),
  door: lpcTile("house", 224, 0, 32, 64),
  computer: lpcTile("cabinets", 64, 64, 32, 32),
  bag: lpcTile("cabinets", 96, 96, 32, 32),
  book: lpcTile("cabinets", 128, 0, 32, 32),
  bed: lpcTile("inside", 128, 128, 64, 48),
  sofa: lpcTile("inside", 64, 160, 64, 32),
  clock: lpcTile("signs", 0, 0, 32, 32),
  window: lpcTile("house", 256, 0, 32, 32),
  blackboard: lpcTile("inside", 192, 0, 64, 48),
  room: lpcTile("inside", 0, 0, 32, 32),
};

function background(kind: SceneKind): BackgroundSpec {
  const grass = lpcTile("grass", 0, 0, 32, 32);
  const dirt = lpcTile("dirt", 32, 0, 32, 32);
  const floor = lpcTile("inside", 0, 0, 32, 32);
  const castle = lpcTile("castlefloors", 0, 0, 32, 32);

  if (kind === "street") {
    return {
      fill: "#7eb6d9",
      bands: [
        { fromRow: 0, toRow: 1, color: "#7eb6d9" },
        { fromRow: 1, toRow: 2, tile: grass },
        { fromRow: 2, toRow: 99, tile: dirt },
      ],
    };
  }
  if (kind === "building-cut") {
    return {
      fill: "#e8dfd0",
      bands: [{ fromRow: 0, toRow: 99, tile: castle }],
    };
  }
  return {
    fill: "#d4c4a8",
    bands: [{ fromRow: 0, toRow: 99, tile: floor }],
  };
}

export const lpcSkin: Skin = {
  id: "lpc",
  titleRu: "LPC (CC-BY-SA)",
  resolve(spriteId) {
    return SPRITES[spriteId] ?? null;
  },
  person(spriteId) {
    return spriteId === "person-2" ? lpcPerson("female") : lpcPerson("male");
  },
  background,
  available: () => true,
};
