const ALLOWED_REDIRECT_PREFIXES = [
  "/",
  "/dictionary",
  "/login",
  "/progress",
  "/review",
  "/topics",
  "/training",
] as const;

function decodeRedirectPath(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

function isAllowedRedirectPath(path: string): boolean {
  return ALLOWED_REDIRECT_PREFIXES.some((prefix) => {
    if (prefix === "/") {
      return path === "/";
    }

    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

/**
 * Accept only same-origin relative paths from an allowlist.
 * Rejects external origins, protocol-relative URLs, and encoded bypasses.
 */
export function sanitizeAuthRedirectPath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw) {
    return fallback;
  }

  const decoded = decodeRedirectPath(raw.trim());
  if (!decoded || !decoded.startsWith("/") || decoded.startsWith("//")) {
    return fallback;
  }

  if (decoded.includes("://") || decoded.includes("\\")) {
    return fallback;
  }

  const normalized = decoded.replace(/\/+$/, "") || "/";

  return isAllowedRedirectPath(normalized) ? normalized : fallback;
}
