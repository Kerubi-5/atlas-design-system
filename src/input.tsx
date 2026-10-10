import * as React from "react"

import {
  disabledState,
  fieldSurface,
  focusRing,
  invalidState,
} from "./internal/styles.js"
import { cn } from "./utils.js"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldSurface,
        focusRing,
        invalidState,
        disabledState,
        "h-10 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
