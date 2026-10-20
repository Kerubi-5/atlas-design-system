"use client"

import { Input } from "../input.js"
import { Textarea } from "../textarea.js"
import { onInputChange } from "../utils.js"

import type { FieldMetaState, FormFieldBaseProps } from "./field-error.js"
import { fieldAria, FormFieldShell, metaErrorText } from "./field-shell.js"

export type TextFieldApi = {
  /** Field name; the default control id. */
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
  /**
   * Control id the label points at. Defaults to `field.name`; pass a unique
   * id when two forms on one page share a field name (login and sign-up
   * `email`), or the second label focuses the first input.
   */
  id?: string
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
  const onChange = onInputChange(field.handleChange)
  const errorText = metaErrorText(field.state.meta, { submitted, showError })
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
