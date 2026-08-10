"use client";

import type { ReactNode } from "react";
import { useActionState, useMemo, useState } from "react";

import { Alert } from "@/components/feedback";
import { Button, Input, Textarea } from "@/components/ui";
import type { AdminActionResult } from "@/features/admin/actions/AdminActionResult";
import { saveGrammarTopicAction } from "@/features/admin/actions/saveGrammarTopicAction";
import { AdminSelectField } from "@/features/admin/components/AdminSelectField/AdminSelectField";
import ui from "@/features/admin/components/adminUi.module.css";
import { MarkdownEditor } from "@/features/admin/components/MarkdownEditor/MarkdownEditor";
import type { UnitOption } from "@/features/admin/data/adminContentRepository";
import type { GrammarTopicFormInput } from "@/features/admin/domain/adminSchemas";
import { STATUS_OPTIONS } from "@/features/admin/domain/statusLabels";
import { errorMessageProp, fieldError } from "@/features/admin/presentation/adminUiHelpers";

export type GrammarTopicFormProps = {
  readonly initialValues?: GrammarTopicFormInput;
  readonly unitOptions: readonly UnitOption[];
  readonly actionsExtra?: ReactNode;
};

export function GrammarTopicForm({
  initialValues,
  unitOptions,
  actionsExtra,
}: GrammarTopicFormProps) {
  const [state, formAction, isPending] = useActionState<AdminActionResult | null, FormData>(
    saveGrammarTopicAction,
    null,
  );
  const [bodyMd, setBodyMd] = useState(initialValues?.bodyMd ?? "");
  const [moduleId, setModuleId] = useState(initialValues?.moduleId ?? "");
  const [status, setStatus] = useState(initialValues?.status ?? "draft");

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
        <AdminSelectField
          label="Юнит"
          name="moduleId"
          onChange={setModuleId}
          options={moduleOptions}
          placeholder="Выберите юнит"
          required
          value={moduleId}
          {...errorMessageProp(fieldError(state, "moduleId"))}
        />
        <Input
          defaultValue={initialValues?.code ?? ""}
          hint="kebab-case"
          label="Code"
          name="code"
          required
          {...errorMessageProp(fieldError(state, "code"))}
        />
        <Input
          defaultValue={initialValues?.logicalId ?? ""}
          hint="например grammar.u01.n01"
          label="Logical ID"
          name="logicalId"
          required
          {...errorMessageProp(fieldError(state, "logicalId"))}
        />
      </div>

      <div className={ui.formRow}>
        <Input
          defaultValue={initialValues?.patternKo ?? ""}
          label="Pattern (ko)"
          name="patternKo"
          required
          {...errorMessageProp(fieldError(state, "patternKo"))}
        />
        <Input
          defaultValue={initialValues?.category ?? ""}
          label="Category"
          name="category"
          required
          {...errorMessageProp(fieldError(state, "category"))}
        />
        <Input
          defaultValue={initialValues?.usageKey ?? ""}
          label="Usage key"
          name="usageKey"
          {...errorMessageProp(fieldError(state, "usageKey"))}
        />
      </div>

      <div className={ui.formRow}>
        <Input
          defaultValue={initialValues?.titleRu ?? ""}
          label="Название (ru)"
          name="titleRu"
          required
          {...errorMessageProp(fieldError(state, "titleRu"))}
        />
        <Input
          defaultValue={initialValues?.titleKo ?? ""}
          label="Название (ko)"
          name="titleKo"
          {...errorMessageProp(fieldError(state, "titleKo"))}
        />
        <AdminSelectField
          label="Статус"
          name="status"
          onChange={(value) => setStatus(value as GrammarTopicFormInput["status"])}
          options={STATUS_OPTIONS}
          value={status}
          {...errorMessageProp(fieldError(state, "status"))}
        />
      </div>

      <div className={ui.formRow}>
        <Textarea
          defaultValue={initialValues?.summaryRu ?? ""}
          label="Краткое описание (ru)"
          name="summaryRu"
          required
          rows={4}
          {...errorMessageProp(fieldError(state, "summaryRu"))}
        />
        <Textarea
          defaultValue={initialValues?.summaryKo ?? ""}
          label="Краткое описание (ko)"
          name="summaryKo"
          rows={4}
          {...errorMessageProp(fieldError(state, "summaryKo"))}
        />
      </div>

      <MarkdownEditor
        label="Описание (markdown)"
        name="bodyMd"
        onChange={setBodyMd}
        required
        value={bodyMd}
        {...errorMessageProp(fieldError(state, "bodyMd"))}
      />

      <div className={ui.formRow}>
        <Input
          defaultValue={initialValues?.level ?? "1급"}
          label="Уровень"
          name="level"
          required
          {...errorMessageProp(fieldError(state, "level"))}
        />
        <Input
          defaultValue={initialValues?.contentVersion ?? "1.0.0"}
          label="Версия"
          name="contentVersion"
          required
          {...errorMessageProp(fieldError(state, "contentVersion"))}
        />
        <Input
          defaultValue={initialValues?.sortOrder ?? 0}
          label="Порядок"
          min={0}
          name="sortOrder"
          type="number"
          {...errorMessageProp(fieldError(state, "sortOrder"))}
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
