import * as React from "react"

import {
  disabledState,
  fieldSurface,
  focusRing,
  invalidState,
} from "./internal/styles.js"
import { cn } from "./utils.js"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldSurface,
        focusRing,
        invalidState,
        disabledState,
        "flex field-sizing-content min-h-16 resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
