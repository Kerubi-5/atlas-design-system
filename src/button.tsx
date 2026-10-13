import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import {
  controlSize,
  disabledState,
  focusRing,
  invalidState,
  selectedState,
} from "./internal/styles.js"
import { cn } from "./utils.js"

/**
 * Outline and ghost hover/focus: selected-foreground border, selected wash, and
 * `selected-foreground` text (primary in light mode, a lighter purple that
 * stays readable on dark), no muted grey fill. Used by quiet actions such as
 * "Clear selection" sitting on a selected row.
 */
const quietButtonInteraction = [
  selectedState.hover,
  "focus-visible:text-selected-foreground",
  selectedState.expanded,
].join(" ")

const buttonVariants = cva(
  [
    focusRing,
    invalidState,
    disabledState,
    "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-xs font-semibold tracking-widest whitespace-nowrap uppercase transition-all select-none active:not-aria-[haspopup]:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline: `border-input bg-transparent ${quietButtonInteraction}`,
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: quietButtonInteraction,
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/15 dark:bg-destructive/20 dark:hover:bg-destructive/25",
        link: "text-selected-foreground underline underline-offset-4 hover:underline",
      },
      size: {
        default: `${controlSize.default} gap-1.5`,
        xs: "h-7 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: `${controlSize.sm} gap-1`,
        lg: `${controlSize.lg} gap-1.5`,
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants, quietButtonInteraction }
