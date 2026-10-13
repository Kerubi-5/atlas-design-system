import { cn } from "../utils.js"

export type FieldErrorMessage = string | { message?: string } | undefined

export type FieldMetaState = {
  errors: FieldErrorMessage[]
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
