import { describe, expect, it } from "vitest";
import { findLexeme, lexemes, positionWords } from "@/lib/ko/lexicon";
import { parseLocationSentence } from "@/lib/ko/parse";
import { resolveTargetCell } from "@/lib/scene/relations";
import { sceneById, scenes, tasks, vocab } from "@/content/topics/location";

describe("location content", () => {
  it("covers all scenes and task types with at least 12 tasks", () => {
    expect(tasks.length).toBeGreaterThanOrEqual(12);
    expect(scenes.map((scene) => scene.id).sort()).toEqual(
      ["building-cut", "classroom", "room", "street"].sort(),
    );
    expect(tasks.some((task) => task.type === "describe")).toBe(true);
    expect(tasks.some((task) => task.type === "command")).toBe(true);
    expect(tasks.some((task) => task.type === "fix")).toBe(true);
    for (const scene of scenes) {
      expect(tasks.some((task) => task.sceneId === scene.id)).toBe(true);
    }
  });

  it("keeps buildings and rooms square (w === h)", () => {
    for (const scene of scenes) {
      for (const entity of scene.entities) {
        if (entity.kind === "building" || entity.kind === "room") {
          expect(entity.w ?? 1).toBe(entity.h ?? 1);
        }
      }
    }
  });

  it("references only entities that exist in the target scene", () => {
    for (const task of tasks) {
      const scene = sceneById[task.sceneId];
      expect(scene, task.sceneId).toBeDefined();
      const ids = new Set(scene.entities.map((entity) => entity.id));
      expect(ids.has(task.subjectId)).toBe(true);
      if (task.type === "command" || task.type === "fix") {
        for (const refId of task.goal.refIds) {
          expect(ids.has(refId)).toBe(true);
        }
      }
    }
  });

  it("makes every command/fix goal reachable via resolveTargetCell", () => {
    for (const task of tasks) {
      if (task.type !== "command" && task.type !== "fix") {
        continue;
      }
      const scene = sceneById[task.sceneId];
      const cell = resolveTargetCell(scene, task.subjectId, task.goal);
      expect(cell, `${task.type}:${task.promptRu}`).not.toBeNull();
    }
  });

  it("keeps fix wrongSentence within parser grammar (fact ≠ goal or particle error)", () => {
    for (const task of tasks) {
      if (task.type !== "fix") {
        continue;
      }
      const scene = sceneById[task.sceneId];
      const ids = scene.entities.map((entity) => entity.id);
      const parsed = parseLocationSentence(task.wrongSentence, ids);
      if (!parsed.ok) {
        expect(parsed.errorRu.length).toBeGreaterThan(0);
        continue;
      }
      const sameRelation = parsed.relation === task.goal.relation;
      const sameRefs =
        parsed.refIds.length === task.goal.refIds.length &&
        parsed.refIds.every((id, index) => id === task.goal.refIds[index]);
      expect(sameRelation && sameRefs).toBe(false);
    }
  });

  it("uses only lexicon hangul for vocab and scene labels (층 allowed)", () => {
    const lexiconKo = new Set(lexemes.map((lexeme) => lexeme.ko));
    for (const word of positionWords) {
      for (const ko of word.ko) {
        lexiconKo.add(ko);
      }
    }
    lexiconKo.add("층");

    for (const word of vocab) {
      expect(lexiconKo.has(word.ko) || findLexeme(word.ko), word.ko).toBeTruthy();
    }

    for (const scene of scenes) {
      for (const entity of scene.entities) {
        expect(findLexeme(entity.ko), `${scene.id}:${entity.id}`).toBeDefined();
      }
    }
  });
});
