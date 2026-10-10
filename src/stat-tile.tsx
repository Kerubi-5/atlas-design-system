import type * as React from "react"

import { cn } from "./utils.js"

/**
 * Uppercase muted label used on tiles and thin section chrome. Apps that
 * only needed a heading class can import this instead of a wrapper.
 */
export const sectionLabel =
  "text-xs font-semibold tracking-widest text-muted-foreground uppercase"

/** Row of tiles: stacked on phones, divided columns from `sm`. */
export const statTileGrid = "grid ring-1 ring-foreground/5 sm:divide-x"

export type StatTileProps = {
  label: string
  value: string
  sub?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

/**
 * Label, big tabular figure, optional extra (a meter), muted sub line.
 * Domain copy and status colors stay in the app.
 */
function StatTile({ label, value, sub, children, className }: StatTileProps) {
  return (
    <div
      data-slot="stat-tile"
      className={cn("flex flex-col gap-1 px-3 py-2", className)}
    >
      <span className={sectionLabel}>{label}</span>
      <span className="text-lg font-semibold tracking-tight tabular-nums">
        {value}
      </span>
      {children}
      {sub ? (
        <span className="text-xs leading-snug text-muted-foreground">
          {sub}
        </span>
      ) : null}
    </div>
  )
}

export { StatTile }
