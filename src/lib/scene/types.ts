export type SpatialRelation =
  | "front"
  | "behind"
  | "beside"
  | "left"
  | "right"
  | "above"
  | "below"
  | "inside"
  | "outside"
  | "between"
  | "near";

export type SceneKind = "street" | "classroom" | "building-cut" | "room";
export type EntityKind = "person" | "building" | "object" | "room" | "decor";

export type SpriteId =
  | "school"
  | "hospital"
  | "bank"
  | "pharmacy"
  | "bookstore"
  | "convenience"
  | "restaurant"
  | "cafe"
  | "house"
  | "tree"
  | "road"
  | "person"
  | "person-2"
  | "desk"
  | "chair"
  | "blackboard"
  | "window"
  | "door"
  | "clock"
  | "bag"
  | "book"
  | "computer"
  | "bed"
  | "sofa"
  | "table"
  | "room"
  | "toilet"
  | "office"
  | "library";

export type SceneEntity = {
  id: string;
  kind: EntityKind;
  sprite: SpriteId;
  ko: string;
  ru: string;
  col: number;
  row: number;
  w?: number;
  h?: number;
  containerId?: string;
  movable?: boolean;
};

export type Scene = {
  id: string;
  kind: SceneKind;
  cols: number;
  rows: number;
  entities: SceneEntity[];
};
