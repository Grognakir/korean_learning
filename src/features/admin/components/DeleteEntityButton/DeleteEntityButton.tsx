"use client";

import { useState, useTransition } from "react";

import { Alert } from "@/components/feedback";
import { Button, Modal } from "@/components/ui";

import styles from "./DeleteEntityButton.module.css";

export type DeleteEntityButtonProps = {
  readonly id: string;
  readonly entityLabel: string;
  readonly action: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function DeleteEntityButton({ id, entityLabel, action }: DeleteEntityButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    if (isPending) {
      return;
    }
    setOpen(false);
    setError(null);
  }

  return (
    <>
      <Button
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        type="button"
        variant="ghost"
      >
        Удалить
      </Button>

      <Modal
        description="Это действие необратимо."
        onClose={closeModal}
        open={open}
        title={`Удалить ${entityLabel}?`}
      >
        <div className={styles.content}>
          {error ? <Alert tone="danger">{error}</Alert> : null}
          <div className={styles.actions}>
            <Button disabled={isPending} onClick={closeModal} type="button" variant="secondary">
              Отмена
            </Button>
            <Button
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const result = await action(id);
                  if (!result.ok) {
                    setError(result.error);
                  }
                });
              }}
              type="button"
              variant="primary"
            >
              {isPending ? "Удаляем..." : "Удалить"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
