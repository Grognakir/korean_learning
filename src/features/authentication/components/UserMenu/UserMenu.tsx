"use client";

import Link from "next/link";
import { useTransition } from "react";

import { Button } from "@/components/ui";
import type { AuthUser } from "@/features/authentication/domain/types";
import { signOutAction } from "@/features/authentication/server/signOutAction";

import styles from "./UserMenu.module.css";

export type UserMenuProps = {
  user?: AuthUser | null;
};

function formatUserLabel(email: string | null): string {
  if (!email) {
    return "Аккаунт";
  }

  const atIndex = email.indexOf("@");
  if (atIndex <= 0) {
    return email;
  }

  return email.slice(0, atIndex);
}

export function UserMenu({ user = null }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();

  if (!user) {
    return (
      <Link className={styles.loginLink} href="/login">
        Войти
      </Link>
    );
  }

  return (
    <div className={styles.menu}>
      <span className={styles.userLabel} title={user.email ?? undefined}>
        {formatUserLabel(user.email)}
      </span>
      <Button
        className={styles.signOutButton}
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await signOutAction();
          });
        }}
        type="button"
        variant="secondary"
      >
        {isPending ? "Выход..." : "Выйти"}
      </Button>
    </div>
  );
}
