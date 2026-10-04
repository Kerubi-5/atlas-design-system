"use client"

import { Input } from "../input.js"
import { Label } from "../label.js"
import { Textarea } from "../textarea.js"
import { onInputChange } from "../utils.js"

import {
  FieldError,
  getFieldErrorMessage,
  type FieldMetaState,
} from "./field-error.js"

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
  const errorText = showError
    ? getFieldErrorMessage(field.state.meta.errors[0])
    : undefined
  const controlProps = {
    id: field.name,
    value: field.state.value,
    onChange,
    onBlur: field.handleBlur,
    placeholder,
    autoComplete,
    required,
    minLength,
    "aria-invalid": errorText ? true : undefined,
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={field.name}>{label}</Label>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {multiline ? (
        <Textarea {...controlProps} rows={rows} />
      ) : (
        <Input {...controlProps} type={inputType} autoFocus={autoFocus} />
      )}
      {showError ? <FieldError text={errorText} /> : null}
    </div>
  )
}
