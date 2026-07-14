import type {
  BackgroundSpec,
  Direction,
  PersonSprite,
  Skin,
  SpriteRef,
} from "@/lib/scene/skin";
import type { SceneKind, SpriteId } from "@/lib/scene/types";

function tile(
  pack: "town" | "dungeon",
  n: number,
): SpriteRef {
  const id = String(n).padStart(4, "0");
  const folder =
    pack === "town" ? "kenney-tiny-town" : "kenney-tiny-dungeon";
  return {
    sheet: `/assets/${folder}/Tiles/tile_${id}.png`,
    x: 0,
    y: 0,
    w: 16,
    h: 16,
  };
}

function house(x: number, y: number, w: number, h: number): SpriteRef {
  return {
    sheet: "/assets/ninja-adventure/tilesets/TilesetHouse.png",
    x,
    y,
    w,
    h,
  };
}

function interior(x: number, y: number, w: number, h: number): SpriteRef {
  return {
    sheet: "/assets/ninja-adventure/tilesets/Interior/Elements.png",
    x,
    y,
    w,
    h,
  };
}

function floor(x: number, y: number): SpriteRef {
  return {
    sheet: "/assets/ninja-adventure/tilesets/Interior/TilesetInteriorFloor.png",
    x,
    y,
    w: 16,
    h: 16,
  };
}

const DIRS: Direction[] = ["down", "up", "left", "right"];

/** Ninja SeparateAnim: Idle row = down, up, left, right; Walk cols = dirs, rows = frames. */
function ninjaPerson(
  name: "Boy" | "Princess" | "Villager" | "Inspector",
): PersonSprite {
  const idleSheet = `/assets/ninja-adventure/characters/${name}/SeparateAnim/Idle.png`;
  const walkSheet = `/assets/ninja-adventure/characters/${name}/SeparateAnim/Walk.png`;
  const idle: PersonSprite["idle"] = {
    down: { sheet: idleSheet, x: 0, y: 0, w: 16, h: 16 },
    up: { sheet: idleSheet, x: 16, y: 0, w: 16, h: 16 },
    left: { sheet: idleSheet, x: 32, y: 0, w: 16, h: 16 },
    right: { sheet: idleSheet, x: 48, y: 0, w: 16, h: 16 },
  };
  const walk: PersonSprite["walk"] = {
    down: [],
    up: [],
    left: [],
    right: [],
  };
  for (let di = 0; di < 4; di++) {
    const dir = DIRS[di];
    for (let fi = 0; fi < 4; fi++) {
      walk[dir].push({
        sheet: walkSheet,
        x: di * 16,
        y: fi * 16,
        w: 16,
        h: 16,
      });
    }
  }
  return { sheet: walkSheet, frameW: 16, frameH: 16, idle, walk };
}

const SPRITES: Partial<Record<SpriteId, SpriteRef>> = {
  // Street buildings — TilesetHouse crops (16px grid; verified via atlas candidates).
  bank: house(0, 0, 48, 64),
  pharmacy: house(160, 0, 48, 48),
  bookstore: house(288, 0, 48, 64),
  cafe: house(240, 0, 48, 64),
  convenience: house(352, 0, 48, 48),
  restaurant: house(400, 0, 48, 80),
  school: house(448, 80, 64, 80),
  hospital: house(96, 80, 48, 48),
  house: house(0, 80, 48, 64),
  office: house(48, 80, 48, 48),
  library: house(144, 96, 48, 48),
  toilet: house(0, 176, 32, 48),

  tree: tile("town", 16),
  road: tile("town", 25),

  // Interior / furniture (Kenney Tiny Dungeon + Ninja interior).
  desk: tile("dungeon", 84),
  table: tile("dungeon", 84),
  chair: tile("dungeon", 85),
  door: tile("dungeon", 45),
  computer: tile("dungeon", 55),
  bag: tile("dungeon", 75),
  book: tile("dungeon", 63),
  bed: tile("dungeon", 87),
  sofa: tile("dungeon", 94),
  clock: tile("dungeon", 56),
  window: tile("town", 96),
  blackboard: interior(0, 0, 32, 32),
  room: floor(16, 16),
};

function background(kind: SceneKind): BackgroundSpec {
  const grass = tile("town", 1);
  const dirt = tile("town", 25);
  const wood = floor(32, 48);
  const stone = floor(80, 16);

  if (kind === "street") {
    return {
      fill: "#9ec8e6",
      bands: [
        { fromRow: 0, toRow: 1, color: "#9ec8e6" },
        { fromRow: 1, toRow: 2, tile: grass },
        { fromRow: 2, toRow: 99, tile: dirt },
      ],
    };
  }
  if (kind === "building-cut") {
    return {
      fill: "#fff6eb",
      bands: [{ fromRow: 0, toRow: 99, tile: stone }],
    };
  }
  return {
    fill: "#f4efe6",
    bands: [{ fromRow: 0, toRow: 99, tile: wood }],
  };
}

export const cc0Skin: Skin = {
  id: "cc0",
  titleRu: "CC0 (Kenney + Ninja)",
  resolve(spriteId) {
    return SPRITES[spriteId] ?? null;
  },
  person(spriteId) {
    return spriteId === "person-2" ? ninjaPerson("Princess") : ninjaPerson("Boy");
  },
  background,
  available: () => true,
};
