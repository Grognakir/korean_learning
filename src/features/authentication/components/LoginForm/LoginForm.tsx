"use client";

import { useMemo, useState } from "react";

import { Alert } from "@/components/feedback";
import { Button, Input } from "@/components/ui";
import { createBrowserSupabaseClient } from "@/lib/supabase/browserClient";

import { loginEmailSchema } from "@/features/authentication/domain/loginEmailSchema";
import { sanitizeAuthRedirectPath } from "@/features/authentication/domain/sanitizeAuthRedirectPath";
import styles from "./LoginForm.module.css";

export type LoginFormProps = {
  callbackError?: string | null;
  nextPath?: string | null;
};

type SubmitState = "idle" | "pending" | "success" | "error";

const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "Ссылка для входа недействительна или уже использована.",
  missing_code: "Не удалось завершить вход. Запросите новую ссылку.",
};

function resolveCallbackError(code: string | null | undefined): string | null {
  if (!code) {
    return null;
  }

  return CALLBACK_ERROR_MESSAGES[code] ?? "Не удалось выполнить вход. Попробуйте ещё раз.";
}

export function LoginForm({ callbackError = null, nextPath = null }: LoginFormProps) {
  const safeNextPath = useMemo(() => sanitizeAuthRedirectPath(nextPath), [nextPath]);
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [formError, setFormError] = useState<string | null>(resolveCallbackError(callbackError));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitState === "pending" || submitState === "success") {
      return;
    }

    const parsed = loginEmailSchema.safeParse(email);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Введите корректный email.");
      setFormError(null);
      return;
    }

    setFieldError(null);
    setFormError(null);
    setSubmitState("pending");

    try {
      const supabase = createBrowserSupabaseClient();
      const redirectTo = new URL("/auth/callback", window.location.origin);
      redirectTo.searchParams.set("next", safeNextPath);

      const { error } = await supabase.auth.signInWithOtp({
        email: parsed.data,
        options: {
          emailRedirectTo: redirectTo.toString(),
        },
      });

      if (error) {
        setSubmitState("error");
        setFormError("Не удалось отправить ссылку для входа. Попробуйте позже.");
        return;
      }

      setSubmitState("success");
    } catch {
      setSubmitState("error");
      setFormError("Не удалось отправить ссылку для входа. Попробуйте позже.");
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <Input
        autoComplete="email"
        disabled={submitState === "pending" || submitState === "success"}
        {...(fieldError ? { errorMessage: fieldError } : {})}
        hint="Мы отправим одноразовую ссылку для входа на указанный адрес."
        inputMode="email"
        label="Email"
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        required
        type="email"
        value={email}
      />

      {formError ? (
        <Alert tone="danger">{formError}</Alert>
      ) : submitState === "success" ? (
        <Alert tone="success">
          Проверьте почту и откройте ссылку для входа. Локальный прогресс на этом устройстве
          сохранится отдельно до синхронизации аккаунта.
        </Alert>
      ) : null}

      <div className={styles.actions}>
        <Button disabled={submitState === "pending" || submitState === "success"} type="submit">
          {submitState === "pending" ? "Отправляем..." : "Получить ссылку для входа"}
        </Button>
      </div>
    </form>
  );
}
