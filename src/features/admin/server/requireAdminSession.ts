import "server-only";

import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "./adminSession";

export class AdminAccessError extends Error {
  readonly code = "ADMIN_ACCESS_DENIED" as const;

  constructor(message = "Admin access denied.") {
    super(message);
    this.name = "AdminAccessError";
  }
}

export async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdminSession(): Promise<void> {
  if (!(await hasAdminSession())) {
    throw new AdminAccessError();
  }
}
