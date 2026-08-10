import type { AdminGrammarTopicListItem } from "@/features/admin/data/adminContentRepository";
import { STATUS_OPTIONS } from "@/features/admin/domain/statusLabels";

export const ADMIN_GRAMMAR_PAGE_SIZE = 10;

const STATUS_VALUES = new Set(STATUS_OPTIONS.map((option) => option.value));

export type AdminGrammarUrlQuery = {
  readonly q: string | null;
  readonly status: string | null;
  readonly unitId: string | null;
  readonly page: number;
};

export type AdminGrammarPageResult = {
  readonly items: readonly AdminGrammarTopicListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
};

function firstString(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseAdminGrammarQuery(params: {
  q?: string | string[];
  status?: string | string[];
  unit?: string | string[];
  page?: string | string[];
}): AdminGrammarUrlQuery {
  const pageRaw = firstString(params.page);
  const pageNumber = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
  const status = firstString(params.status);

  return {
    q: firstString(params.q),
    status: status && STATUS_VALUES.has(status as (typeof STATUS_OPTIONS)[number]["value"])
      ? status
      : null,
    unitId: firstString(params.unit),
    page: Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1,
  };
}

export function buildAdminGrammarHref(query: {
  readonly q?: string | null;
  readonly status?: string | null;
  readonly unitId?: string | null;
  readonly page?: number;
}): string {
  const params = new URLSearchParams();
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.status) {
    params.set("status", query.status);
  }
  if (query.unitId) {
    params.set("unit", query.unitId);
  }
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }
  const serialized = params.toString();
  return serialized ? `/admin/grammar?${serialized}` : "/admin/grammar";
}

function matchesQuery(topic: AdminGrammarTopicListItem, q: string): boolean {
  const needle = q.toLocaleLowerCase("ru-RU");
  return (
    topic.patternKo.toLocaleLowerCase("ru-RU").includes(needle) ||
    topic.titleRu.toLocaleLowerCase("ru-RU").includes(needle) ||
    topic.logicalId.toLocaleLowerCase("ru-RU").includes(needle)
  );
}

export function filterAdminGrammarTopics(
  topics: readonly AdminGrammarTopicListItem[],
  query: Pick<AdminGrammarUrlQuery, "q" | "status" | "unitId">,
): AdminGrammarTopicListItem[] {
  return topics.filter((topic) => {
    if (query.status && topic.status !== query.status) {
      return false;
    }
    if (query.unitId && topic.moduleId !== query.unitId) {
      return false;
    }
    if (query.q && !matchesQuery(topic, query.q)) {
      return false;
    }
    return true;
  });
}

export function paginateAdminGrammarTopics(
  topics: readonly AdminGrammarTopicListItem[],
  query: AdminGrammarUrlQuery,
  pageSize: number = ADMIN_GRAMMAR_PAGE_SIZE,
): AdminGrammarPageResult {
  const filtered = filterAdminGrammarTopics(topics, query);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const page = Math.min(Math.max(1, query.page), totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}
