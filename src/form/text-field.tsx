"use client"

import { Input } from "../input.js"
import { fieldNameProps } from "../internal/form-control.js"
import { Textarea } from "../textarea.js"
import { onInputChange } from "../utils.js"

import type { FieldMetaState, FormFieldBaseProps } from "./field-error.js"
import { fieldAria, FormFieldShell, useFormField } from "./field-shell.js"

export type TextFieldApi = {
  /** Field name; put on the control as `data-field-name` for `focusFirstInvalid`. */
  name: string
  state: {
    /** Current text. */
    value: string
    /** Error meta; its first error shows under the control. */
    meta: FieldMetaState
  }
  /** Called with the new text on every change. */
  handleChange: (value: string) => void
  /** Called when the control loses focus, to mark the field touched. */
  handleBlur: () => void
}

/**
 * Props the text and Markdown fields share: both bind to a TanStack Form
 * `field` and render a text control.
 */
export type TextFieldBaseProps = FormFieldBaseProps & {
  /** The TanStack Form field (or the same shape) the control reads and writes. */
  field: TextFieldApi
  /** Sets `required` on the text control and marks the label. */
  required?: boolean
  /** Forwarded to the text control (the input or textarea). */
  className?: string
}

/**
 * Text input, or a textarea with `multiline`, bound to a TanStack Form
 * `field`, with a label, optional hint, and the `form/*` error text.
 */
export function FormTextField({
  field,
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
}: TextFieldBaseProps & {
  /** Text shown in the empty control. */
  placeholder?: string
  /** Optional hint under the label (employer vs referrer, etc.). */
  description?: string
  /** Focuses the input on mount (ignored with `multiline`). */
  autoFocus?: boolean
  /** Renders a textarea instead of an input. */
  multiline?: boolean
  /** Textarea rows when `multiline` is set. Default 3. */
  rows?: number
  /** The input's `type` when not `multiline`. Default "text". */
  inputType?:
    | "text"
    | "email"
    | "password"
    | "date"
    | "datetime-local"
    | "time"
    | "number"
  /** Forwarded to the control's `autoComplete`. */
  autoComplete?: string
  /** Minimum text length (native form validation). */
  minLength?: number
}) {
  const { id, errorText } = useFormField(field.state.meta, {
    submitted,
    showError,
  })
  const onChange = onInputChange(field.handleChange)
  const controlProps = {
    id,
    ...fieldNameProps(field.name),
    value: field.state.value,
    onChange,
    onBlur: field.handleBlur,
    placeholder,
    autoComplete,
    required,
    minLength,
    className,
    ...fieldAria(id, errorText, { description }),
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
