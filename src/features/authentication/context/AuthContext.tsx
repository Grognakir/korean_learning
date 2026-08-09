"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { AuthUser } from "@/features/authentication/domain/types";

type AuthActions = {
  readonly setUser: (user: AuthUser | null) => void;
};

const AuthUserContext = createContext<AuthUser | null>(null);
const AuthActionsContext = createContext<AuthActions | null>(null);

export type AuthProviderProps = {
  children: ReactNode;
  user: AuthUser | null;
};

export function AuthProvider({ children, user: initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const actions = useMemo(() => ({ setUser }), [setUser]);

  return (
    <AuthActionsContext.Provider value={actions}>
      <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>
    </AuthActionsContext.Provider>
  );
}

export function useAuthUser(): AuthUser | null {
  return useContext(AuthUserContext);
}

export function useAuthActions(): AuthActions {
  const actions = useContext(AuthActionsContext);

  if (!actions) {
    throw new Error("useAuthActions must be used within AuthProvider.");
  }

  return actions;
}
