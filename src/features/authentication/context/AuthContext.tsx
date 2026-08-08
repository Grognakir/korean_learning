"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { AuthUser } from "@/features/authentication/domain/types";

const AuthContext = createContext<AuthUser | null>(null);

export type AuthProviderProps = {
  children: ReactNode;
  user: AuthUser | null;
};

export function AuthProvider({ children, user }: AuthProviderProps) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuthUser(): AuthUser | null {
  return useContext(AuthContext);
}
