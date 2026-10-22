import type * as React from "react"

import { clamp } from "./internal/math.js"
import { cn } from "./utils.js"

export type MeterMarker = {
  /** Same scale as `value` / `min` / `max` (not a 0–1 fraction). */
  position: number
  /** Classes for the tick, e.g. its color. */
  className?: string
}

export type MeterProps = Omit<
  React.ComponentProps<"div">,
  "children" | "role" | "aria-label"
> & {
  /** Current reading. Clamped to `min`–`max`; a non-finite value shows as empty. */
  value: number
  /** Start of the scale. Default `0`. */
  min?: number
  /** End of the scale. */
  max: number
  /** App-owned fill (status, pace). Defaults to primary. */
  fillClassName?: string
  /** Thin ticks drawn over the track, e.g. a cap or a typical value. */
  markers?: MeterMarker[]
  /** Required accessible name; the meter has no visible label. */
  "aria-label": string
  /** Classes for the track. */
  className?: string
}

/**
 * Track, fill, and optional ticks for a current value against a scale.
 * Use `Progress` for a plain 0–100 job bar. The app chooses fill color and
 * marker positions (80% of a cap, 1.0× typical, and so on).
 */
function Meter({
  value,
  min = 0,
  max,
  fillClassName = "bg-primary",
  markers,
  "aria-label": ariaLabel,
  className,
  ...props
}: MeterProps) {
  const span = max - min
  // A NaN reading (missing data upstream) draws and announces as empty.
  const current = Number.isFinite(value) ? value : min
  const toPercent = (amount: number) => {
    if (span === 0) return 0
    return clamp(((amount - min) / span) * 100, 0, 100)
  }

  return (
    <div
      {...props}
      role="meter"
      data-slot="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clamp(current, min, max)}
      aria-label={ariaLabel}
      className={cn(
        "relative h-1.5 w-full overflow-hidden bg-input",
        className
      )}
    >
      <div
        data-slot="meter-fill"
        className={cn("h-full", fillClassName)}
        style={{ width: `${toPercent(current)}%` }}
      />
      {markers?.map((marker) => (
        <div
          key={marker.position}
          aria-hidden
          data-slot="meter-marker"
          className={cn(
            "absolute inset-y-0 w-px bg-foreground/40",
            marker.className
          )}
          style={{ left: `${toPercent(marker.position)}%` }}
        />
      ))}
    </div>
  )
}

export { Meter }
