"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { disabledState, focusRing, invalidState } from "./internal/styles.js"
import { cn } from "./utils.js"

/**
 * On/off setting that applies immediately (notifications, dark mode). Use
 * `Checkbox` for choices submitted with a form. Square like the other
 * primitives; checked uses the primary fill, as `Checkbox` does.
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        focusRing,
        invalidState,
        disabledState,
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-none border border-transparent bg-input p-0.5 shadow-xs transition-colors data-checked:bg-primary dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-3.5 rounded-none bg-background shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
