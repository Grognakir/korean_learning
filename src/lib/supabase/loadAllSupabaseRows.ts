export type SupabaseRowPage<T> = {
  readonly data: readonly T[] | null;
  readonly error: { readonly message: string } | null;
};

export class SupabaseRowPaginationError extends Error {
  readonly code = "SUPABASE_ROW_PAGINATION_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "SupabaseRowPaginationError";
  }
}

export async function loadAllSupabaseRows<T>(
  loadPage: (from: number, to: number) => PromiseLike<SupabaseRowPage<T>>,
  pageSize = 1000,
): Promise<readonly T[]> {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await loadPage(from, from + pageSize - 1);
    if (error) {
      throw new SupabaseRowPaginationError(error.message);
    }

    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) {
      return rows;
    }
  }
}
