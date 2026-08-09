"use client";

import { useEffect } from "react";

import { useAuthActions } from "@/features/authentication/context/AuthContext";
import type { AuthUser } from "@/features/authentication/domain/types";

export type AuthUserSyncProps = {
  readonly user: AuthUser | null;
};

export function AuthUserSync({ user }: AuthUserSyncProps) {
  const { setUser } = useAuthActions();

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  return null;
}
