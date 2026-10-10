import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils.js"

/**
 * Status tone sits on the title and icon. The description stays
 * `text-muted-foreground` on the card face, so body text keeps its contrast
 * (the destructive tint is too faint for text in light mode).
 */
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-none border bg-card px-4 py-3 text-sm text-card-foreground has-[>svg]:grid-cols-[--spacing(4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "[&>svg]:text-foreground",
        success:
          "border-success/40 *:data-[slot=alert-title]:text-success [&>svg]:text-success",
        warning:
          "border-warning/40 *:data-[slot=alert-title]:text-warning [&>svg]:text-warning",
        destructive:
          "border-destructive/40 *:data-[slot=alert-title]:text-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Inline message about the page or a section (save failed, trial ending).
 * Destructive alerts use `role="alert"` so screen readers announce them;
 * others are `role="status"`. Use a toast for transient confirmations.
 */
function Alert({
  className,
  variant = "default",
  role,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role={role ?? (variant === "destructive" ? "alert" : "status")}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4 text-xs font-semibold tracking-wider uppercase",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm leading-relaxed text-muted-foreground [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle, alertVariants }
