import type { Scene, SceneEntity, SpatialRelation } from "@/lib/scene/types";

export type RelationFact = { relation: SpatialRelation; refIds: string[] };

type Rect = { col: number; row: number; w: number; h: number };

function entityW(entity: SceneEntity): number {
  return entity.w ?? 1;
}

function entityH(entity: SceneEntity): number {
  return entity.h ?? 1;
}

function rectOf(entity: SceneEntity): Rect {
  return {
    col: entity.col,
    row: entity.row,
    w: entityW(entity),
    h: entityH(entity),
  };
}

function colEnd(rect: Rect): number {
  return rect.col + rect.w;
}

function rowEnd(rect: Rect): number {
  return rect.row + rect.h;
}

function colsOverlap(a: Rect, b: Rect): boolean {
  return a.col < colEnd(b) && b.col < colEnd(a);
}

function rowsOverlap(a: Rect, b: Rect): boolean {
  return a.row < rowEnd(b) && b.row < rowEnd(a);
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return colsOverlap(a, b) && rowsOverlap(a, b);
}

function chebyshevGap(a: Rect, b: Rect): number {
  let dx = 0;
  if (colEnd(a) <= b.col) {
    dx = b.col - colEnd(a);
  } else if (colEnd(b) <= a.col) {
    dx = a.col - colEnd(b);
  }

  let dy = 0;
  if (rowEnd(a) <= b.row) {
    dy = b.row - rowEnd(a);
  } else if (rowEnd(b) <= a.row) {
    dy = a.row - rowEnd(b);
  }

  return Math.max(dx, dy);
}

function findEntity(scene: Scene, id: string): SceneEntity | undefined {
  return scene.entities.find((entity) => entity.id === id);
}

function sameRow(a: Rect, b: Rect): boolean {
  return a.row === b.row;
}

function isLeftOf(s: Rect, r: Rect): boolean {
  return colEnd(s) <= r.col && rowsOverlap(s, r);
}

function isRightOf(s: Rect, r: Rect): boolean {
  return colEnd(r) <= s.col && rowsOverlap(s, r);
}

function isBeside(s: Rect, r: Rect): boolean {
  const adjacent =
    colEnd(s) === r.col || colEnd(r) === s.col;
  return adjacent && sameRow(s, r);
}

function isAbove(s: Rect, r: Rect): boolean {
  return rowEnd(s) <= r.row && colsOverlap(s, r);
}

function isBelow(s: Rect, r: Rect): boolean {
  return rowEnd(r) <= s.row && colsOverlap(s, r);
}

function isFront(scene: Scene, s: Rect, r: Rect): boolean {
  if (scene.kind === "street") {
    return s.row === r.row + r.h && colsOverlap(s, r);
  }
  if (scene.kind === "classroom" || scene.kind === "room") {
    return s.row === r.row + r.h && colsOverlap(s, r);
  }
  return false;
}

function isBehind(scene: Scene, s: Rect, r: Rect): boolean {
  if (scene.kind !== "street") {
    return false;
  }
  return rowEnd(s) === r.row && colsOverlap(s, r);
}

function isInside(subject: SceneEntity, ref: SceneEntity): boolean {
  return subject.containerId === ref.id;
}

function isNear(s: Rect, r: Rect, subject: SceneEntity, ref: SceneEntity): boolean {
  if (isInside(subject, ref)) {
    return false;
  }
  return chebyshevGap(s, r) <= 1;
}

function isOutside(subject: SceneEntity, ref: SceneEntity, s: Rect, r: Rect): boolean {
  if (ref.kind !== "building" && ref.kind !== "room") {
    return false;
  }
  if (isInside(subject, ref)) {
    return false;
  }
  return isNear(s, r, subject, ref);
}

function isBetween(s: Rect, r1: Rect, r2: Rect): boolean {
  if (!sameRow(s, r1) || !sameRow(s, r2)) {
    return false;
  }
  const left = r1.col <= r2.col ? r1 : r2;
  const right = r1.col <= r2.col ? r2 : r1;
  return colEnd(left) <= s.col && colEnd(s) <= right.col;
}

function holdsAgainstRefs(
  scene: Scene,
  subject: SceneEntity,
  relation: SpatialRelation,
  refs: SceneEntity[],
): boolean {
  const s = rectOf(subject);

  switch (relation) {
    case "left":
      return refs.length === 1 && isLeftOf(s, rectOf(refs[0]));
    case "right":
      return refs.length === 1 && isRightOf(s, rectOf(refs[0]));
    case "beside":
      return refs.length === 1 && isBeside(s, rectOf(refs[0]));
    case "above":
      return refs.length === 1 && isAbove(s, rectOf(refs[0]));
    case "below":
      return refs.length === 1 && isBelow(s, rectOf(refs[0]));
    case "front":
      return refs.length === 1 && isFront(scene, s, rectOf(refs[0]));
    case "behind":
      return refs.length === 1 && isBehind(scene, s, rectOf(refs[0]));
    case "inside":
      return refs.length === 1 && isInside(subject, refs[0]);
    case "outside":
      return refs.length === 1 && isOutside(subject, refs[0], s, rectOf(refs[0]));
    case "near":
      return refs.length === 1 && isNear(s, rectOf(refs[0]), subject, refs[0]);
    case "between":
      return refs.length === 2 && isBetween(s, rectOf(refs[0]), rectOf(refs[1]));
    default:
      return false;
  }
}

export function holds(
  scene: Scene,
  subjectId: string,
  fact: RelationFact,
): boolean {
  const subject = findEntity(scene, subjectId);
  if (!subject) {
    return false;
  }
  const refs: SceneEntity[] = [];
  for (const refId of fact.refIds) {
    const ref = findEntity(scene, refId);
    if (!ref || ref.kind === "decor") {
      return false;
    }
    refs.push(ref);
  }
  return holdsAgainstRefs(scene, subject, fact.relation, refs);
}

export function getTrueRelations(
  scene: Scene,
  subjectId: string,
): RelationFact[] {
  const subject = findEntity(scene, subjectId);
  if (!subject) {
    return [];
  }

  const others = scene.entities.filter(
    (entity) => entity.id !== subjectId && entity.kind !== "decor",
  );
  const facts: RelationFact[] = [];
  const singleRelations: SpatialRelation[] = [
    "left",
    "right",
    "beside",
    "above",
    "below",
    "front",
    "behind",
    "inside",
    "outside",
    "near",
  ];

  for (const ref of others) {
    for (const relation of singleRelations) {
      const fact = { relation, refIds: [ref.id] };
      if (holds(scene, subjectId, fact)) {
        facts.push(fact);
      }
    }
  }

  for (let i = 0; i < others.length; i += 1) {
    for (let j = i + 1; j < others.length; j += 1) {
      const a = others[i];
      const b = others[j];
      if (!sameRow(rectOf(a), rectOf(b)) || !sameRow(rectOf(subject), rectOf(a))) {
        continue;
      }
      const fact = { relation: "between" as const, refIds: [a.id, b.id] };
      if (holds(scene, subjectId, fact)) {
        facts.push(fact);
      }
    }
  }

  return facts;
}

type TargetCell = { col: number; row: number; containerId?: string };

function subjectAt(
  subject: SceneEntity,
  col: number,
  row: number,
  containerId?: string,
): SceneEntity {
  const next: SceneEntity = { ...subject, col, row };
  if (containerId !== undefined) {
    next.containerId = containerId;
  } else {
    delete next.containerId;
  }
  return next;
}

function inBounds(scene: Scene, subject: SceneEntity, col: number, row: number): boolean {
  const w = entityW(subject);
  const h = entityH(subject);
  return col >= 0 && row >= 0 && col + w <= scene.cols && row + h <= scene.rows;
}

function isBlocked(
  scene: Scene,
  subject: SceneEntity,
  col: number,
  row: number,
): boolean {
  const candidate = { col, row, w: entityW(subject), h: entityH(subject) };
  for (const entity of scene.entities) {
    if (entity.id === subject.id) {
      continue;
    }
    if (entity.kind === "room") {
      continue;
    }
    if (entity.kind === "building" && scene.kind === "building-cut") {
      continue;
    }
    if (
      entity.movable &&
      entity.kind !== "person"
    ) {
      continue;
    }
    if (rectsOverlap(candidate, rectOf(entity))) {
      return true;
    }
  }
  return false;
}

function chebyshevFrom(subject: SceneEntity, col: number, row: number): number {
  const a = rectOf(subject);
  const b = { col, row, w: entityW(subject), h: entityH(subject) };
  const dx = Math.abs(a.col - b.col);
  const dy = Math.abs(a.row - b.row);
  return Math.max(dx, dy);
}

function pickClosest(
  subject: SceneEntity,
  cells: TargetCell[],
): TargetCell | null {
  if (cells.length === 0) {
    return null;
  }
  let best = cells[0];
  let bestDist = chebyshevFrom(subject, best.col, best.row);
  for (let i = 1; i < cells.length; i += 1) {
    const cell = cells[i];
    const dist = chebyshevFrom(subject, cell.col, cell.row);
    if (
      dist < bestDist ||
      (dist === bestDist &&
        (cell.row < best.row || (cell.row === best.row && cell.col < best.col)))
    ) {
      best = cell;
      bestDist = dist;
    }
  }
  return best;
}

function collectValidCells(
  scene: Scene,
  subject: SceneEntity,
  fact: RelationFact,
  candidates: TargetCell[],
): TargetCell[] {
  const valid: TargetCell[] = [];
  for (const cell of candidates) {
    if (!inBounds(scene, subject, cell.col, cell.row)) {
      continue;
    }
    if (isBlocked(scene, subject, cell.col, cell.row)) {
      continue;
    }
    const moved = subjectAt(subject, cell.col, cell.row, cell.containerId);
    const trialScene: Scene = {
      ...scene,
      entities: scene.entities.map((entity) =>
        entity.id === subject.id ? moved : entity,
      ),
    };
    if (holds(trialScene, subject.id, fact)) {
      valid.push(cell);
    }
  }
  return valid;
}

function candidatesForFact(
  scene: Scene,
  subject: SceneEntity,
  fact: RelationFact,
  refs: SceneEntity[],
): TargetCell[] {
  const sw = entityW(subject);
  const sh = entityH(subject);
  const cells: TargetCell[] = [];

  const push = (col: number, row: number, containerId?: string) => {
    cells.push(containerId === undefined ? { col, row } : { col, row, containerId });
  };

  switch (fact.relation) {
    case "left": {
      const r = rectOf(refs[0]);
      for (let row = 0; row < scene.rows; row += 1) {
        for (let col = 0; col <= r.col - sw; col += 1) {
          push(col, row);
        }
      }
      break;
    }
    case "right": {
      const r = rectOf(refs[0]);
      for (let row = 0; row < scene.rows; row += 1) {
        for (let col = colEnd(r); col < scene.cols; col += 1) {
          push(col, row);
        }
      }
      break;
    }
    case "beside": {
      const r = rectOf(refs[0]);
      push(r.col - sw, r.row);
      push(colEnd(r), r.row);
      break;
    }
    case "above": {
      const r = rectOf(refs[0]);
      for (let row = 0; row <= r.row - sh; row += 1) {
        for (let col = 0; col < scene.cols; col += 1) {
          push(col, row);
        }
      }
      break;
    }
    case "below": {
      const r = rectOf(refs[0]);
      for (let row = rowEnd(r); row < scene.rows; row += 1) {
        for (let col = 0; col < scene.cols; col += 1) {
          push(col, row);
        }
      }
      break;
    }
    case "front": {
      const r = rectOf(refs[0]);
      const row = r.row + r.h;
      for (let col = r.col - sw + 1; col < colEnd(r); col += 1) {
        push(col, row);
      }
      break;
    }
    case "behind": {
      const r = rectOf(refs[0]);
      const row = r.row - sh;
      for (let col = r.col - sw + 1; col < colEnd(r); col += 1) {
        push(col, row);
      }
      break;
    }
    case "inside": {
      const r = rectOf(refs[0]);
      for (let row = r.row; row <= rowEnd(r) - sh; row += 1) {
        for (let col = r.col; col <= colEnd(r) - sw; col += 1) {
          push(col, row, refs[0].id);
        }
      }
      break;
    }
    case "outside":
    case "near": {
      for (let row = 0; row < scene.rows; row += 1) {
        for (let col = 0; col < scene.cols; col += 1) {
          push(col, row);
        }
      }
      break;
    }
    case "between": {
      const a = rectOf(refs[0]);
      const b = rectOf(refs[1]);
      const left = a.col <= b.col ? a : b;
      const right = a.col <= b.col ? b : a;
      const row = left.row;
      for (let col = colEnd(left); col <= right.col - sw; col += 1) {
        push(col, row);
      }
      break;
    }
    default:
      break;
  }

  return cells;
}

export function resolveTargetCell(
  scene: Scene,
  subjectId: string,
  fact: RelationFact,
): TargetCell | null {
  const subject = findEntity(scene, subjectId);
  if (!subject) {
    return null;
  }

  const refs: SceneEntity[] = [];
  for (const refId of fact.refIds) {
    const ref = findEntity(scene, refId);
    if (!ref || ref.kind === "decor") {
      return null;
    }
    refs.push(ref);
  }

  if (fact.relation === "between" && refs.length !== 2) {
    return null;
  }
  if (fact.relation !== "between" && refs.length !== 1) {
    return null;
  }

  const candidates = candidatesForFact(scene, subject, fact, refs);
  const valid = collectValidCells(scene, subject, fact, candidates);
  return pickClosest(subject, valid);
}
