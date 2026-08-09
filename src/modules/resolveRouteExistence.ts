import { DEMO_TRAINING_SESSION_ID } from "@/features/training/sessionConstants";

import { HONORIFICS_MODULE_SLUG, HONORIFICS_PREVIEW_SESSION_ID } from "./honorifics/previewConstants";

export type ContentRoute =
  | { readonly kind: "module"; readonly slug: string }
  | { readonly kind: "session"; readonly sessionId: string };

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

  if (route.sessionId === DEMO_TRAINING_SESSION_ID) {
    return true;
  }

  return (
    route.sessionId === HONORIFICS_PREVIEW_SESSION_ID &&
    publishedModuleSlugs.has(HONORIFICS_MODULE_SLUG)
  );
}
