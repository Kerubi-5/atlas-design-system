import type { ReactNode } from "react"

import type { FieldErrorItem } from "../field.js"
import { cn } from "../utils.js"

/** An error as TanStack Form reports it: text, or an error with a `message`. */
export type FieldErrorMessage = string | FieldErrorItem

export type FieldMetaState = {
  /** Validation errors for the field; the `form/*` fields show the first. */
  errors: FieldErrorMessage[]
  /**
   * Whether the person has changed or left the field (TanStack Form's
   * `meta.isTouched`). When it is `false`, the `form/*` fields hold back
   * the error until the field is touched or their `submitted` prop is set.
   * Leave it out to show errors as soon as they exist.
   */
  isTouched?: boolean
}

/** When a field shows its error: the `form/*` fields' shared timing props. */
export type ErrorTimingProps = {
  /**
   * Set once the form has been submitted, so an untouched field shows its
   * error too. For form libraries that do not mark fields touched on
   * submit; TanStack Form does, so its users pass `meta` only. Only matters
   * when `meta.isTouched` is passed.
   */
  submitted?: boolean
  /** When false, never shows error text or invalid styling. Default true. */
  showError?: boolean
}

/**
 * Props every labelled `form/*` field shares: the error timing, the label,
 * and the classes for the field wrapper.
 */
export type FormFieldBaseProps = ErrorTimingProps & {
  /** Visible label text (the legend, for a checkbox group). */
  label: string
  /**
   * Classes for the field wrapper (`data-slot="form-field"`: label, hint,
   * control, and error), e.g. a width.
   */
  fieldClassName?: string
}

/** Error meta for the `form/*` fields that are not bound to a `field` API. */
export type FormFieldMetaProps = {
  /**
   * The field's meta (TanStack Form's `field.state.meta`); its first error
   * shows under the control. Leave it out for no error text.
   */
  meta?: FieldMetaState
}

/** The optional hint the `form/*` fields render under the label. */
export type FormFieldDescriptionProps = {
  /** Hint between the label and the control, read with the control. */
  description?: ReactNode
}

/** First TanStack Form error message for a field, if any. */
export function getFieldErrorMessage(
  message: FieldErrorMessage
): string | undefined {
  if (typeof message === "string") return message
  return message?.message
}

export function FieldError({
  id,
  message,
  text,
  className,
}: {
  /** Point the control's `aria-describedby` here so the error is read with it. */
  id?: string
  /** Error to show, as TanStack Form reports it; ignored when `text` is set. */
  message?: FieldErrorMessage
  /** Error text to show as is; takes precedence over `message`. */
  text?: string
  /** Classes for the error paragraph. */
  className?: string
}) {
  const resolved = text ?? getFieldErrorMessage(message)
  if (!resolved) return null
  return (
    <p
      id={id}
      data-slot="form-field-error"
      className={cn("text-xs text-destructive", className)}
      role="alert"
    >
      {resolved}
    </p>
  )
}
