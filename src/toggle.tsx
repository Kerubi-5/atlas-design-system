"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import {
  controlSize,
  controlText,
  disabledState,
  focusRing,
  inlineIcon,
  invalidState,
  selectedState,
} from "./internal/styles.js"
import { cn } from "./utils.js"

/**
 * Selected chrome shared by Toggle and ToggleGroupItem (see
 * `selectedState.toggle`): the wash, selected text, and a selected border
 * for `data-state=on`, `aria-pressed`, and `aria-checked`.
 *
 * @deprecated `toggleVariants()` already includes this chrome. Removed in 2.0.
 */
const selectedToggleChrome = selectedState.toggle

const toggleVariants = cva(
  [
    focusRing,
    selectedState.hover,
    selectedState.toggle,
    invalidState,
    disabledState,
    "group/toggle inline-flex items-center justify-center gap-1.5 rounded-none",
    controlText,
    "transition-colors focus-visible:text-selected-foreground",
    inlineIcon.default,
  ],
  {
    variants: {
      variant: {
        default: "border border-transparent bg-transparent",
        outline: "border border-input bg-transparent",
      },
      size: {
        default: `${controlSize.default} min-w-10`,
        sm: `${controlSize.sm} min-w-9`,
        lg: `${controlSize.lg} min-w-11`,
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants, selectedToggleChrome }
