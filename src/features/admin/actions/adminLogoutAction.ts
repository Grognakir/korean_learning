"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE_NAME } from "../server/adminSession";

export async function adminLogoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: ADMIN_SESSION_COOKIE_NAME,
    path: "/admin",
  });
  redirect("/admin/login");
}
