const EXERCISE_START = /^delete from public\.exercise_options\b/iu;
const PROVENANCE_START = /^insert into public\.content_provenance\b/iu;

function executablePrefix(statement: string): string {
  return statement.replace(/^(?:\s*--[^\n]*(?:\n|$))+/u, "").trimStart();
}

export function splitCurriculumSql(sql: string): string[] {
  let body = sql.trim();
  if (body.startsWith("begin;")) body = body.slice("begin;".length).trim();
  if (body.endsWith("commit;")) body = body.slice(0, -"commit;".length).trim();

  return body
    .split(/;\s*\n(?=(?:--|insert|delete|update|with)\b)/iu)
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return "";
      return trimmed.endsWith(";") ? trimmed : `${trimmed};`;
    })
    .filter(Boolean);
}

export function groupCurriculumStatements(statements: string[]): string[][] {
  const groups: string[][] = [];
  let exerciseGroup: string[] | null = null;

  for (const statement of statements) {
    const prefix = executablePrefix(statement);

    if (EXERCISE_START.test(prefix)) {
      if (exerciseGroup) groups.push(exerciseGroup);
      exerciseGroup = [statement];
      continue;
    }

    if (exerciseGroup && PROVENANCE_START.test(prefix)) {
      groups.push(exerciseGroup);
      exerciseGroup = null;
    }

    if (exerciseGroup) {
      exerciseGroup.push(statement);
    } else {
      groups.push([statement]);
    }
  }

  if (exerciseGroup) groups.push(exerciseGroup);
  return groups;
}

export function packCurriculumGroups(groups: string[][], maxBytes: number): string[] {
  const chunks: string[] = [];
  let current: string[] = [];
  let size = 0;

  for (const group of groups) {
    const text = group.join("\n\n");
    const groupSize = Buffer.byteLength(text) + 2;
    if (groupSize > maxBytes) {
      throw new Error(`Curriculum statement group exceeds chunk limit: ${groupSize} > ${maxBytes}`);
    }
    if (current.length > 0 && size + groupSize > maxBytes) {
      chunks.push(current.join("\n\n"));
      current = [];
      size = 0;
    }
    current.push(text);
    size += groupSize;
  }

  if (current.length) chunks.push(current.join("\n\n"));
  return chunks;
}
