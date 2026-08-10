export type AdminActionResult =
  | { ok: true; id: string }
  | { ok: false; fieldErrors?: Record<string, string[]>; formError?: string };
