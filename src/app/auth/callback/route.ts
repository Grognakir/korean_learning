import { NextResponse, type NextRequest } from "next/server";

import { sanitizeAuthRedirectPath } from "@/features/authentication/domain/sanitizeAuthRedirectPath";
import { createRouteHandlerSupabaseClient } from "@/features/authentication/server/createRouteHandlerSupabaseClient";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = sanitizeAuthRedirectPath(requestUrl.searchParams.get("next"));

  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  const redirectTarget = new URL(nextPath, requestUrl.origin);
  const response = NextResponse.redirect(redirectTarget);
  const supabase = createRouteHandlerSupabaseClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
