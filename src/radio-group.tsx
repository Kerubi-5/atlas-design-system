"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { disabledState, focusRing, invalidState } from "./internal/styles.js"
import { cn } from "./utils.js"

/**
 * One choice from a short, visible list. Arrow keys move the selection.
 * Use `Select` or `Combobox` when the list is long.
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

/**
 * Radio dot. Radios stay round (a circle, per the shape rules) so they read
 * differently from square checkboxes.
 */
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        focusRing,
        invalidState,
        disabledState,
        "peer relative flex aspect-square size-4.5 shrink-0 items-center justify-center rounded-full border border-input bg-transparent shadow-xs transition-shadow after:absolute after:-inset-x-3 after:-inset-y-2 data-checked:border-primary",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <span className="size-2 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
