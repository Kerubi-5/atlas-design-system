import type * as React from "react"

import { cn } from "./utils.js"

type Props = React.ComponentProps<"div"> & {
  children: React.ReactNode
  /**
   * `sm` is tighter padding for compact widgets; `default` is standard form
   * empty states. `md` is a deprecated alias of `default`, kept until 2.0.
   */
  size?: "sm" | "default" | "lg" | "md"
  muted?: boolean
  className?: string
}

/** Dashed empty-state panel for lists, widgets, and form sections. Other props go to the root `div`. */
export function EmptyPanel({
  children,
  size = "default",
  muted = true,
  className,
  ...props
}: Props) {
  return (
    <div
      data-slot="empty-panel"
      {...props}
      className={cn(
        "rounded-none border border-dashed text-center text-sm text-muted-foreground",
        muted && "bg-muted/30",
        size === "sm" && "px-3 py-4",
        (size === "default" || size === "md") && "px-4 py-6",
        size === "lg" && "px-4 py-8",
        className
      )}
    >
      {children}
    </div>
  )
}
