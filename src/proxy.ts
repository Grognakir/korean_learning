import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/features/authentication/server/updateSession";
import { getPublishedModuleSlugs } from "@/modules/publishedModuleSlugs";
import { isKnownContentRoute, matchContentRoute } from "@/modules/resolveRouteExistence";

/**
 * Cache Components streams a static shell before the page can call `notFound()`, so an unknown
 * slug would answer `200`. Checking existence here keeps the real `404` status.
 */
async function isMissingContentRoute(pathname: string): Promise<boolean> {
  const contentRoute = matchContentRoute(pathname);

  if (!contentRoute) {
    return false;
  }

  try {
    return !isKnownContentRoute(contentRoute, await getPublishedModuleSlugs());
  } catch {
    // A content-store failure must not hide working routes; the page renders its own error state.
    return false;
  }
}

export async function proxy(request: NextRequest) {
  if (await isMissingContentRoute(request.nextUrl.pathname)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
