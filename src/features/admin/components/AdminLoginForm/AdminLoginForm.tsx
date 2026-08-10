"use client";

import { useActionState } from "react";

import { Alert } from "@/components/feedback";
import { Button, Input } from "@/components/ui";

import {
  adminLoginAction,
  type AdminLoginResult,
} from "@/features/admin/actions/adminLoginAction";

import styles from "./AdminLoginForm.module.css";

export type AdminLoginFormProps = {
  readonly defaultUsername?: string;
  readonly defaultPassword?: string;
};

export function AdminLoginForm({
  defaultUsername = "",
  defaultPassword = "",
}: AdminLoginFormProps) {
  const [state, formAction, isPending] = useActionState<AdminLoginResult | null, FormData>(
    adminLoginAction,
    null,
  );

  return (
    <form action={formAction} className={styles.form} noValidate>
      <Input
        autoComplete="username"
        defaultValue={defaultUsername}
        disabled={isPending}
        label="Логин"
        name="username"
        required
        type="text"
      />
      <Input
        autoComplete="current-password"
        defaultValue={defaultPassword}
        disabled={isPending}
        label="Пароль"
        name="password"
        required
        type="password"
      />

      {state && !state.ok ? <Alert tone="danger">{state.error}</Alert> : null}

      <div className={styles.actions}>
        <Button disabled={isPending} type="submit">
          {isPending ? "Входим..." : "Войти"}
        </Button>
      </div>
    </form>
  );
}
