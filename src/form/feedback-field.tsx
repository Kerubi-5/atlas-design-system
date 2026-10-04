/** Form-level submit or mutation error (not tied to a single field). */
export function FormFeedbackField({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}
