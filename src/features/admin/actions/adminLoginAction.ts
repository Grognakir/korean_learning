"use server";

import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { parseAdminEnv } from "../server/adminEnv";
import { ADMIN_SESSION_COOKIE_NAME, createAdminSessionToken } from "../server/adminSession";

export type AdminLoginResult = { ok: true } | { ok: false; error: string };

function safeEqualString(left: string, right: string): boolean {
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);

  if (leftBuf.length !== rightBuf.length) {
    timingSafeEqual(leftBuf, leftBuf);
    return false;
  }

  return timingSafeEqual(leftBuf, rightBuf);
}

export async function adminLoginAction(
  _prevState: AdminLoginResult | null,
  formData: FormData,
): Promise<AdminLoginResult> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const env = parseAdminEnv();

  const usernameOk = safeEqualString(username, env.username);
  const passwordOk = safeEqualString(password, env.password);

  if (!usernameOk || !passwordOk) {
    return { ok: false, error: "Неверный логин или пароль" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, createAdminSessionToken(env), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}
