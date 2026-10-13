import { cn } from "../utils.js"

/** Form-level submit or mutation error (not tied to a single field). */
export function FormFeedbackField({
  message,
  className,
}: {
  message: string | null
  className?: string
}) {
  if (!message) return null
  return (
    <p
      data-slot="form-feedback"
      className={cn("text-sm text-destructive", className)}
      role="alert"
    >
      {message}
    </p>
  )
}
