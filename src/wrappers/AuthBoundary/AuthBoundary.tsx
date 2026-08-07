import type { ReactNode } from "react";

export type AuthBoundaryProps = {
  children: ReactNode;
};

export function AuthBoundary({ children }: AuthBoundaryProps) {
  return children;
}
