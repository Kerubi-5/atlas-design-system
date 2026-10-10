import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { cn } from "./utils.js"

/**
 * Indeterminate loading indicator for a button or small region. Announced as
 * "Loading" by default; pass `aria-label` for something more specific. Use
 * `Skeleton` or `TableBodySkeleton` when the layout of the result is known.
 */
function Spinner({
  className,
  "aria-label": ariaLabel = "Loading",
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label={ariaLabel}
      data-slot="spinner"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
