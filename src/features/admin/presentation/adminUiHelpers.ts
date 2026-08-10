import type { AdminActionResult } from "@/features/admin/actions/AdminActionResult";

export function fieldError(
  state: AdminActionResult | null,
  field: string,
): string | undefined {
  if (!state || state.ok) {
    return undefined;
  }
  return state.fieldErrors?.[field]?.[0];
}

export function errorMessageProp(
  message: string | undefined,
): { errorMessage: string } | Record<string, never> {
  return message ? { errorMessage: message } : {};
}

export function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("ru-RU");
}

/** Newest first; equal timestamps fall back to unit number ascending (nulls last). */
export function compareByUpdatedAtThenUnitNumber(
  a: { readonly updatedAt: string; readonly unitNumber: number | null },
  b: { readonly updatedAt: string; readonly unitNumber: number | null },
): number {
  const byUpdatedAt = b.updatedAt.localeCompare(a.updatedAt);
  if (byUpdatedAt !== 0) {
    return byUpdatedAt;
  }

  if (a.unitNumber === null && b.unitNumber === null) {
    return 0;
  }
  if (a.unitNumber === null) {
    return 1;
  }
  if (b.unitNumber === null) {
    return -1;
  }
  return a.unitNumber - b.unitNumber;
}

export function statusBreakdown(items: readonly { status: string }[]): string {
  const counts = {
    draft: 0,
    reviewed: 0,
    published: 0,
    archived: 0,
  };

  for (const item of items) {
    if (item.status in counts) {
      counts[item.status as keyof typeof counts] += 1;
    }
  }

  return `Черновиков: ${counts.draft} · Проверено: ${counts.reviewed} · Опубликовано: ${counts.published} · Архив: ${counts.archived}`;
}
