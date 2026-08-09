export const CATALOG_VIEWS = ["themes", "grammar"] as const;

export type CatalogView = (typeof CATALOG_VIEWS)[number];

export function parseCatalogView(value: string | string[] | undefined | null): CatalogView {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "grammar") {
    return "grammar";
  }
  return "themes";
}
