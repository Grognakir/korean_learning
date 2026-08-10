"use client";

import { useId } from "react";

import { Select, type SelectOption } from "@/components/ui";
import ui from "@/features/admin/components/adminUi.module.css";

export type AdminSelectFieldProps = {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly options: readonly SelectOption[];
  readonly onChange: (value: string) => void;
  readonly errorMessage?: string;
  readonly placeholder?: string;
  readonly required?: boolean;
};

export function AdminSelectField({
  errorMessage,
  label,
  name,
  onChange,
  options,
  placeholder,
  required = false,
  value,
}: AdminSelectFieldProps) {
  const labelId = useId();
  const selectId = useId();

  return (
    <div className={ui.field}>
      <span className={ui.label} id={labelId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <input name={name} type="hidden" value={value} />
      <Select
        aria-labelledby={labelId}
        id={selectId}
        onChange={onChange}
        options={options}
        value={value}
        {...(placeholder ? { placeholder } : {})}
      />
      {errorMessage ? <p className={ui.error}>{errorMessage}</p> : null}
    </div>
  );
}
