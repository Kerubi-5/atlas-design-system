import { cn } from "../utils.js"

/** Form-level submit or mutation error (not tied to a single field). */
export function FormFeedbackField({
  message,
  className,
}: {
  /** Error text to show; `null` or empty renders nothing. */
  message: string | null
  /** Classes for the message paragraph. */
  className?: string
}) {
  if (!message) return null
  return (
    <p
      data-slot="form-feedback"
      className={cn(
        "border-t border-destructive pt-3 text-sm text-destructive",
        className
      )}
      role="alert"
    >
      {message}
    </p>
  )
}
