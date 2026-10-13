import type * as React from "react"

import { cn } from "./utils.js"

type Props = React.ComponentProps<"div"> & {
  children: React.ReactNode
  /** Tighter padding for compact widgets; default is standard form empty states. */
  size?: "sm" | "md" | "lg"
  muted?: boolean
  className?: string
}

/** Dashed empty-state panel for lists, widgets, and form sections. Other props go to the root `div`. */
export function EmptyPanel({
  children,
  size = "md",
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
        size === "md" && "px-4 py-6",
        size === "lg" && "px-4 py-8",
        className
      )}
    >
      {children}
    </div>
  )
}
