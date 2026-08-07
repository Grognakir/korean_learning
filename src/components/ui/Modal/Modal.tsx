"use client";

import type { ComponentPropsWithRef, KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef } from "react";

import { classNames } from "@/lib/utilities";

import { Button } from "../Button";
import styles from "./Modal.module.css";

const FOCUSABLE_ELEMENTS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type ModalProps = Omit<
  ComponentPropsWithRef<"dialog">,
  "children" | "onClose" | "open" | "title"
> & {
  children: ReactNode;
  closeLabel?: string;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function Modal({
  children,
  className,
  closeLabel = "Закрыть",
  description,
  onClose,
  open,
  ref,
  title,
  ...props
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const setRef = useCallback(
    (node: HTMLDialogElement | null) => {
      dialogRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;

      if (!dialog.open) {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          dialog.setAttribute("open", "");
        }
      }

      dialog.querySelector<HTMLElement>(FOCUSABLE_ELEMENTS)?.focus();
      return;
    }

    if (dialog.open) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }

    previousFocusRef.current?.focus();
    previousFocusRef.current = null;
  }, [open]);

  useEffect(
    () => () => {
      previousFocusRef.current?.focus();
    },
    [],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS),
    );
    const firstElement = focusableElements.at(0);
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) {
      event.preventDefault();
      event.currentTarget.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal="true"
      className={classNames(styles.modal, className)}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={handleKeyDown}
      ref={setRef}
      {...props}
    >
      <div className={styles.header}>
        <div className={styles.heading}>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
          {description ? (
            <p className={styles.description} id={descriptionId}>
              {description}
            </p>
          ) : null}
        </div>
        <Button aria-label={closeLabel} className={styles.close} onClick={onClose} variant="ghost">
          <span aria-hidden="true">×</span>
        </Button>
      </div>
      <div className={styles.content}>{children}</div>
    </dialog>
  );
}
