"use client"

import { Input } from "../input.js"
import { Textarea } from "../textarea.js"
import { onInputChange } from "../utils.js"

import type { FieldMetaState } from "./field-error.js"
import { FormFieldShell, invalidWhen, metaErrorText } from "./field-shell.js"

export type TextFieldApi = {
  name: string
  state: {
    value: string
    meta: FieldMetaState
  }
  handleChange: (value: string) => void
  handleBlur: () => void
}

export function FormTextField({
  field,
  id = field.name,
  label,
  placeholder,
  description,
  autoFocus,
  multiline,
  rows = 3,
  inputType = "text",
  showError = true,
  autoComplete,
  required,
  minLength,
}: {
  field: TextFieldApi
  /**
   * Control id the label points at. Defaults to `field.name`; pass a unique
   * id when two forms on one page share a field name (login and sign-up
   * `email`), or the second label focuses the first input.
   */
  id?: string
  label: string
  placeholder?: string
  /** Optional hint under the label (employer vs referrer, etc.). */
  description?: string
  autoFocus?: boolean
  multiline?: boolean
  /** Textarea rows when `multiline` is set. */
  rows?: number
  inputType?:
    | "text"
    | "email"
    | "password"
    | "date"
    | "datetime-local"
    | "time"
    | "number"
  /** When true (default), shows meta.errors and aria-invalid styling. */
  showError?: boolean
  autoComplete?: string
  required?: boolean
  minLength?: number
}) {
  const onChange = onInputChange(field.handleChange)
  const errorText = showError ? metaErrorText(field.state.meta) : undefined
  const controlProps = {
    id,
    value: field.state.value,
    onChange,
    onBlur: field.handleBlur,
    placeholder,
    autoComplete,
    required,
    minLength,
    "aria-invalid": invalidWhen(errorText),
  }

  return (
    <FormFieldShell id={id} label={label} errorText={errorText}>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {multiline ? (
        <Textarea {...controlProps} rows={rows} />
      ) : (
        <Input {...controlProps} type={inputType} autoFocus={autoFocus} />
      )}
    </FormFieldShell>
  )
}
