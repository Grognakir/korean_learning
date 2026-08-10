"use client";

import type { ReactNode } from "react";
import { useActionState, useMemo, useState } from "react";

import { Alert } from "@/components/feedback";
import { Button, Input, Textarea } from "@/components/ui";
import type { AdminActionResult } from "@/features/admin/actions/AdminActionResult";
import { saveDictionaryEntryAction } from "@/features/admin/actions/saveDictionaryEntryAction";
import { AdminSelectField } from "@/features/admin/components/AdminSelectField/AdminSelectField";
import ui from "@/features/admin/components/adminUi.module.css";
import type { UnitOption } from "@/features/admin/data/adminContentRepository";
import type { DictionaryEntryFormInput } from "@/features/admin/domain/adminSchemas";
import { STATUS_OPTIONS } from "@/features/admin/domain/statusLabels";
import { errorMessageProp, fieldError } from "@/features/admin/presentation/adminUiHelpers";

export type DictionaryEntryFormProps = {
  readonly initialValues?: DictionaryEntryFormInput;
  readonly unitOptions: readonly UnitOption[];
  readonly actionsExtra?: ReactNode;
};

export function DictionaryEntryForm({
  initialValues,
  unitOptions,
  actionsExtra,
}: DictionaryEntryFormProps) {
  const [state, formAction, isPending] = useActionState<AdminActionResult | null, FormData>(
    saveDictionaryEntryAction,
    null,
  );
  const [status, setStatus] = useState(initialValues?.status ?? "draft");
  const [primaryModuleId, setPrimaryModuleId] = useState(initialValues?.primaryModuleId ?? "");

  const moduleOptions = useMemo(
    () => [
      { value: "", label: "Выберите юнит" },
      ...unitOptions.map((option) => ({
        value: option.id,
        label: `${option.slug} — ${option.titleRu}`,
      })),
    ],
    [unitOptions],
  );

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
          defaultValue={initialValues?.logicalId ?? ""}
          hint="например dict.집.home"
          label="Logical ID"
          name="logicalId"
          required
          {...errorMessageProp(fieldError(state, "logicalId"))}
        />
        <Input
          defaultValue={initialValues?.senseKey ?? ""}
          label="Sense key"
          name="senseKey"
          required
          {...errorMessageProp(fieldError(state, "senseKey"))}
        />
        <Input
          defaultValue={initialValues?.lemmaKo ?? ""}
          label="Lemma (ko)"
          name="lemmaKo"
          required
          {...errorMessageProp(fieldError(state, "lemmaKo"))}
        />
      </div>

      <div className={ui.formRow}>
        <Input
          defaultValue={initialValues?.partOfSpeech ?? ""}
          hint="например 명사, 동사"
          label="Часть речи"
          name="partOfSpeech"
          required
          {...errorMessageProp(fieldError(state, "partOfSpeech"))}
        />
        <Input
          defaultValue={initialValues?.transliteration ?? ""}
          label="Транслитерация"
          name="transliteration"
          {...errorMessageProp(fieldError(state, "transliteration"))}
        />
        <Input
          defaultValue={initialValues?.level ?? ""}
          label="Уровень"
          name="level"
          {...errorMessageProp(fieldError(state, "level"))}
        />
      </div>

      <div className={ui.formRow}>
        <Textarea
          defaultValue={(initialValues?.meaningsRu ?? []).join("\n")}
          hint="по одному значению на строку"
          label="Значения (ru)"
          name="meaningsRu"
          required
          rows={5}
          {...errorMessageProp(fieldError(state, "meaningsRu"))}
        />
        <Textarea
          defaultValue={initialValues?.usageNoteRu ?? ""}
          label="Заметка об употреблении"
          name="usageNoteRu"
          rows={5}
          {...errorMessageProp(fieldError(state, "usageNoteRu"))}
        />
      </div>

      <div className={ui.formRow}>
        <Input
          defaultValue={initialValues?.contentVersion ?? "1.0.0"}
          label="Версия"
          name="contentVersion"
          required
          {...errorMessageProp(fieldError(state, "contentVersion"))}
        />
        <AdminSelectField
          label="Статус"
          name="status"
          onChange={(value) => setStatus(value as DictionaryEntryFormInput["status"])}
          options={STATUS_OPTIONS}
          value={status}
          {...errorMessageProp(fieldError(state, "status"))}
        />
        <AdminSelectField
          label="Основной юнит"
          name="primaryModuleId"
          onChange={setPrimaryModuleId}
          options={moduleOptions}
          placeholder="Выберите юнит"
          required
          value={primaryModuleId}
          {...errorMessageProp(fieldError(state, "primaryModuleId"))}
        />
      </div>

      <div className={ui.actions}>
        <Button disabled={isPending} type="submit">
          {isPending ? "Сохраняем..." : "Сохранить"}
        </Button>
        {actionsExtra}
      </div>
    </form>
  );
}
