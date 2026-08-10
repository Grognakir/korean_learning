"use client";

import type { ReactNode } from "react";
import { useActionState, useState } from "react";

import { Alert } from "@/components/feedback";
import { Button, Input, Textarea } from "@/components/ui";
import type { AdminActionResult } from "@/features/admin/actions/AdminActionResult";
import { saveUnitAction } from "@/features/admin/actions/saveUnitAction";
import { AdminSelectField } from "@/features/admin/components/AdminSelectField/AdminSelectField";
import ui from "@/features/admin/components/adminUi.module.css";
import {
  unitNumberFromSlug,
  type UnitFormInput,
} from "@/features/admin/domain/adminSchemas";
import { STATUS_OPTIONS } from "@/features/admin/domain/statusLabels";
import { errorMessageProp, fieldError } from "@/features/admin/presentation/adminUiHelpers";

export type UnitFormProps = {
  readonly initialValues?: UnitFormInput;
  readonly actionsExtra?: ReactNode;
};

export function UnitForm({ initialValues, actionsExtra }: UnitFormProps) {
  const [state, formAction, isPending] = useActionState<AdminActionResult | null, FormData>(
    saveUnitAction,
    null,
  );
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [status, setStatus] = useState(initialValues?.status ?? "draft");
  const derivedUnitNumber = unitNumberFromSlug(slug);

  return (
    <form action={formAction} className={ui.form} noValidate>
      {state && !state.ok && state.formError ? (
        <Alert tone="danger">{state.formError}</Alert>
      ) : null}

      {initialValues?.id ? (
        <input defaultValue={initialValues.id} name="id" type="hidden" />
      ) : null}

      <div className={ui.formRow}>
        <Input
          hint="латиницей, например u01 — технический код для ссылок"
          label="Код юнита"
          name="slug"
          onChange={(event) => setSlug(event.target.value)}
          required
          value={slug}
          {...errorMessageProp(fieldError(state, "slug"))}
        />
        <Input
          defaultValue={initialValues?.level ?? "1급"}
          label="Уровень"
          name="level"
          required
          {...errorMessageProp(fieldError(state, "level"))}
        />
        <Input
          hint={
            derivedUnitNumber === null
              ? "заполняется само из кода вида u01…u16"
              : "берётся из кода юнита"
          }
          label="№ юнита"
          name="unitNumber"
          readOnly
          value={derivedUnitNumber ?? ""}
          {...errorMessageProp(fieldError(state, "unitNumber"))}
        />
      </div>

      <div className={ui.formRow}>
        <Input
          defaultValue={initialValues?.titleKo ?? ""}
          label="Название (ko)"
          name="titleKo"
          required
          {...errorMessageProp(fieldError(state, "titleKo"))}
        />
        <Input
          defaultValue={initialValues?.titleRu ?? ""}
          label="Название (ru)"
          name="titleRu"
          required
          {...errorMessageProp(fieldError(state, "titleRu"))}
        />
        <AdminSelectField
          label="Статус"
          name="status"
          onChange={(value) => setStatus(value as UnitFormInput["status"])}
          options={STATUS_OPTIONS}
          value={status}
          {...errorMessageProp(fieldError(state, "status"))}
        />
      </div>

      <Textarea
        defaultValue={initialValues?.descriptionRu ?? ""}
        label="Описание"
        name="descriptionRu"
        required
        rows={5}
        {...errorMessageProp(fieldError(state, "descriptionRu"))}
      />

      <div className={ui.actions}>
        <Button disabled={isPending} type="submit">
          {isPending ? "Сохраняем..." : "Сохранить"}
        </Button>
        {actionsExtra}
      </div>
    </form>
  );
}
