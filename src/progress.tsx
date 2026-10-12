"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "./utils.js"

/**
 * Determinate progress (uploads, multi-step jobs). `value` runs from 0 to
 * `max` (default 100) and is clamped to that range; omit it (or pass a
 * non-number) for an indeterminate state and pair the bar with a visible
 * label.
 */
function Progress({
  className,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const scale = Number.isFinite(max) && max > 0 ? max : 100
  const current =
    value != null && Number.isFinite(value)
      ? Math.min(scale, Math.max(0, value))
      : null
  const filled = current == null ? 0 : (current / scale) * 100

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={current}
      max={scale}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-none bg-primary/15",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-transform"
        style={{ transform: `translateX(-${100 - filled}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
