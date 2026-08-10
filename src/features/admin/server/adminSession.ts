import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { parseAdminEnv, type AdminEnv } from "./adminEnv";

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function signPayload(payloadB64: string, sessionSecret: string): string {
  return createHmac("sha256", sessionSecret).update(payloadB64).digest("hex");
}

export function createAdminSessionToken(
  env: AdminEnv = parseAdminEnv(),
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const payloadB64 = Buffer.from(JSON.stringify({ exp: Date.now() + ttlMs }), "utf8").toString(
    "base64url",
  );
  return `${payloadB64}.${signPayload(payloadB64, env.sessionSecret)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null,
  env: AdminEnv = parseAdminEnv(),
): boolean {
  if (!token) {
    return false;
  }

  try {
    const separator = token.indexOf(".");
    if (separator <= 0 || separator === token.length - 1) {
      return false;
    }

    const payloadB64 = token.slice(0, separator);
    const signature = token.slice(separator + 1);
    if (!payloadB64 || !signature) {
      return false;
    }

    const expected = signPayload(payloadB64, env.sessionSecret);
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length) {
      return false;
    }
    if (!timingSafeEqual(left, right)) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      exp?: unknown;
    };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
