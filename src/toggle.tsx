"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "./utils.js"

/**
 * Selected chrome shared by standalone Toggle and ToggleGroupItem.
 *
 * Radix Toggle sets `data-state=on` and `aria-pressed`. ToggleGroup items
 * always set `data-state=on`; in multiple mode they also set `aria-pressed`,
 * but in single mode they are radios with `aria-checked` and no
 * `aria-pressed`. All three selectors apply the same wash, text, and
 * selected-foreground border so the state meets WCAG 1.4.11 in every mode.
 */
const selectedToggleChrome =
  "data-on:border-selected-foreground data-on:bg-selected data-on:text-selected-foreground aria-pressed:border-selected-foreground aria-pressed:bg-selected aria-pressed:text-selected-foreground aria-checked:border-selected-foreground aria-checked:bg-selected aria-checked:text-selected-foreground"

const toggleVariants = cva(
  `group/toggle inline-flex items-center justify-center gap-1.5 rounded-none text-xs font-semibold tracking-widest whitespace-nowrap uppercase transition-colors outline-none hover:border-selected-foreground hover:bg-selected hover:text-selected-foreground focus-visible:border-ring focus-visible:text-selected-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 ${selectedToggleChrome} [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5`,
  {
    variants: {
      variant: {
        default: "border border-transparent bg-transparent",
        outline: "border border-input bg-transparent",
      },
      size: {
        default:
          "h-10 min-w-10 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        sm: "h-9 min-w-9 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: "h-11 min-w-11 px-8 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
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
