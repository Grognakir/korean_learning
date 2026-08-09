import { isFilteredSessionId } from "@/features/training/setup/filteredSessionId";

export type ContentRoute =
  | { readonly kind: "module"; readonly slug: string }
  | { readonly kind: "session"; readonly sessionId: string };

/**
 * Cache Components requires at least one prerendered param, so an empty or unreachable catalog
 * still has to name a module route. This slug is deliberately never published: the shell behind
 * `Suspense` is identical for every slug, and Proxy answers `404` for it like any unknown module.
 */
export const PLACEHOLDER_MODULE_SLUG = "content-unavailable";

const MODULE_ROUTE = /^\/topics\/([^/]+)\/?$/;
const SESSION_ROUTE = /^\/training\/([^/]+)\/?$/;

function decodeSegment(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

export function matchContentRoute(pathname: string): ContentRoute | null {
  const moduleMatch = MODULE_ROUTE.exec(pathname);

  if (moduleMatch) {
    const slug = decodeSegment(moduleMatch[1]!);
    return slug === null ? null : { kind: "module", slug };
  }

  const sessionMatch = SESSION_ROUTE.exec(pathname);

  if (sessionMatch) {
    const sessionId = decodeSegment(sessionMatch[1]!);
    return sessionId === null ? null : { kind: "session", sessionId };
  }

  return null;
}

/** Mirrors `resolveSession` and the module lookup so Proxy and page rendering cannot disagree. */
export function isKnownContentRoute(
  route: ContentRoute,
  publishedModuleSlugs: ReadonlySet<string>,
): boolean {
  if (route.kind === "module") {
    return publishedModuleSlugs.has(route.slug);
  }

  return isFilteredSessionId(route.sessionId);
}
