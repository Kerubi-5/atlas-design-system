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
  message,
  text,
}: {
  message?: FieldErrorMessage
  text?: string
}) {
  const resolved = text ?? getFieldErrorMessage(message)
  if (!resolved) return null
  return (
    <p className="text-xs text-destructive" role="alert">
      {resolved}
    </p>
  )
}
