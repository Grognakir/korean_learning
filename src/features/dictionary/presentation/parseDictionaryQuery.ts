export type DictionaryUrlQuery = {
  readonly unitSlug: string | null;
  readonly pos: string | null;
  readonly page: number;
};

function firstString(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseDictionaryQuery(params: {
  unit?: string | string[];
  pos?: string | string[];
  page?: string | string[];
}): DictionaryUrlQuery {
  const pageRaw = firstString(params.page);
  const pageNumber = pageRaw ? Number.parseInt(pageRaw, 10) : 1;

  return {
    unitSlug: firstString(params.unit),
    pos: firstString(params.pos),
    page: Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1,
  };
}

export function buildDictionaryHref(query: {
  readonly unitSlug?: string | null;
  readonly pos?: string | null;
  readonly page?: number;
}): string {
  const params = new URLSearchParams();
  if (query.unitSlug) {
    params.set("unit", query.unitSlug);
  }
  if (query.pos) {
    params.set("pos", query.pos);
  }
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }
  const serialized = params.toString();
  return serialized ? `/dictionary?${serialized}` : "/dictionary";
}
