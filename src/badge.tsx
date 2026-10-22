import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import type { AsChildProps } from "./internal/as-child.js"
import { controlText, focusRing, invalidState } from "./internal/styles.js"
import { cn } from "./utils.js"

const badgeVariants = cva(
  [
    focusRing,
    invalidState,
    "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-none border-0 bg-transparent px-0 py-0",
    controlText,
    // Smaller than `controlText`'s `text-xs`; tailwind-merge keeps this one.
    "text-[0.625rem] transition-colors has-data-[icon=inline-end]:pr-0 has-data-[icon=inline-start]:pl-0 [&>svg]:pointer-events-none [&>svg:not([class*='size-'])]:size-3",
  ],
  {
    variants: {
      variant: {
        default: "text-foreground [a]:hover:text-foreground/70",
        secondary: "text-muted-foreground [a]:hover:text-foreground",
        destructive: "text-destructive [a]:hover:text-destructive/70",
        outline: "text-foreground [a]:hover:text-foreground/70",
        ghost: "text-muted-foreground hover:text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        /** Tinted chip; pick its color with `tone`. */
        soft: "px-2 py-0.5",
      },
      /** Only `soft` reads this. */
      tone: {
        neutral: "",
        success: "",
        warning: "",
        destructive: "",
      },
    },
    compoundVariants: [
      {
        variant: "soft",
        tone: "neutral",
        className: "border border-border/60 bg-muted/50 text-foreground",
      },
      {
        variant: "soft",
        tone: "success",
        className: "bg-success/15 text-success",
      },
      {
        variant: "soft",
        tone: "warning",
        className: "bg-warning/15 text-warning",
      },
      {
        variant: "soft",
        tone: "destructive",
        className: "bg-destructive/15 text-destructive",
      },
    ],
    defaultVariants: {
      variant: "default",
      tone: "neutral",
    },
  }
)

function Badge({
  className,
  variant = "default",
  tone,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> &
  AsChildProps) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, tone }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
