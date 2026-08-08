import type { ReactNode } from "react";

import { AuthProvider } from "@/features/authentication/context/AuthContext";
import type { AuthUser } from "@/features/authentication/domain/types";

export type AuthBoundaryProps = {
  children: ReactNode;
  user: AuthUser | null;
};

export function AuthBoundary({ children, user }: AuthBoundaryProps) {
  return <AuthProvider user={user}>{children}</AuthProvider>;
}
