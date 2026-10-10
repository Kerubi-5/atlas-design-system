import { cn } from "./utils.js"

export type MeterMarker = {
  /** Same scale as `value` / `min` / `max` (not a 0–1 fraction). */
  position: number
  className?: string
}

export type MeterProps = {
  value: number
  min?: number
  max: number
  /** App-owned fill (status, pace). Defaults to primary. */
  fillClassName?: string
  markers?: MeterMarker[]
  "aria-label": string
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
}: MeterProps) {
  const span = max - min
  const toPercent = (amount: number) => {
    if (span === 0) return 0
    return Math.min(100, Math.max(0, ((amount - min) / span) * 100))
  }

  return (
    <div
      role="meter"
      data-slot="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.min(max, Math.max(min, value))}
      aria-label={ariaLabel}
      className={cn(
        "relative h-1.5 w-full overflow-hidden bg-muted",
        className
      )}
    >
      <div
        data-slot="meter-fill"
        className={cn("h-full", fillClassName)}
        style={{ width: `${toPercent(value)}%` }}
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
