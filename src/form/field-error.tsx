import { cn } from "../utils.js"

export type FieldErrorMessage = string | { message?: string } | undefined

export type FieldMetaState = {
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
   * Set once the form has been submitted (TanStack Form:
   * `form.state.submissionAttempts > 0`), so an untouched field shows its
   * error too. Only matters when `meta.isTouched` is passed.
   */
  submitted?: boolean
  /** When false, never shows error text or invalid styling. Default true. */
  showError?: boolean
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
  message?: FieldErrorMessage
  text?: string
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
