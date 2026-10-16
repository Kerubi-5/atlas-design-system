"use client"

import { Input } from "../input.js"
import { Textarea } from "../textarea.js"
import { onInputChange } from "../utils.js"

import type { ErrorTimingProps, FieldMetaState } from "./field-error.js"
import {
  describedBy,
  descriptionIdFor,
  FormFieldShell,
  invalidWhen,
  metaErrorText,
} from "./field-shell.js"

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
  showError,
  submitted,
  autoComplete,
  required,
  minLength,
  className,
  fieldClassName,
}: ErrorTimingProps & {
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
  autoComplete?: string
  /** Sets `required` on the control and marks the label. */
  required?: boolean
  minLength?: number
  /** Forwarded to the input or textarea. */
  className?: string
  /** Classes for the field wrapper (label, hint, control, and error). */
  fieldClassName?: string
}) {
  const onChange = onInputChange(field.handleChange)
  const errorText = metaErrorText(field.state.meta, { submitted, showError })
  const descriptionId = description ? descriptionIdFor(id) : undefined
  const controlProps = {
    id,
    value: field.state.value,
    onChange,
    onBlur: field.handleBlur,
    placeholder,
    autoComplete,
    required,
    minLength,
    className,
    "aria-invalid": invalidWhen(errorText),
    "aria-describedby": describedBy(id, errorText, descriptionId),
  }

  return (
    <FormFieldShell
      id={id}
      label={label}
      description={description}
      errorText={errorText}
      required={required}
      className={fieldClassName}
    >
      {multiline ? (
        <Textarea {...controlProps} rows={rows} />
      ) : (
        <Input {...controlProps} type={inputType} autoFocus={autoFocus} />
      )}
    </FormFieldShell>
  )
}
