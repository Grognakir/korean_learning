export type LearningSkill = "grammar" | "vocabulary" | "reading";

export type ParsedConceptKey =
  | {
      readonly kind: "skill-target";
      readonly skill: LearningSkill;
      readonly targetLogicalId: string;
    }
  | { readonly kind: "legacy-exercise"; readonly exerciseLogicalId: string };

const SKILLS = new Set<LearningSkill>(["grammar", "vocabulary", "reading"]);

export function buildSkillConceptKey(skill: LearningSkill, targetLogicalId: string): string {
  const target = targetLogicalId.trim();
  if (!target) {
    throw new Error("concept target logical id is required");
  }
  return `${skill}:${target}`;
}

export function parseConceptKey(conceptKey: string): ParsedConceptKey {
  const value = conceptKey.trim();
  const separator = value.indexOf(":");
  if (separator <= 0) {
    return { kind: "legacy-exercise", exerciseLogicalId: value };
  }

  const skill = value.slice(0, separator);
  const targetLogicalId = value.slice(separator + 1).trim();
  if (!SKILLS.has(skill as LearningSkill) || !targetLogicalId) {
    return { kind: "legacy-exercise", exerciseLogicalId: value };
  }

  return {
    kind: "skill-target",
    skill: skill as LearningSkill,
    targetLogicalId,
  };
}

export function conceptKeysMatch(left: string, right: string): boolean {
  if (left === right) return true;
  const parsedLeft = parseConceptKey(left);
  const parsedRight = parseConceptKey(right);
  if (parsedLeft.kind === "skill-target" && parsedRight.kind === "skill-target") {
    return (
      parsedLeft.skill === parsedRight.skill &&
      parsedLeft.targetLogicalId === parsedRight.targetLogicalId
    );
  }
  return false;
}
