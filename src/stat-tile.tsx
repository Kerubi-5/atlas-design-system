import type * as React from "react"

import { sectionLabel } from "./internal/styles.js"
import { cn } from "./utils.js"

/**
 * Uppercase muted label used on tiles and thin section chrome. Apps that
 * only needed a heading class can import this instead of a wrapper.
 */
export { sectionLabel }

/** Row of tiles: stacked on phones, divided columns from `sm`. */
export const statTileGrid = "grid ring-1 ring-foreground/5 sm:divide-x"

export type StatTileProps = Omit<
  React.ComponentProps<"div">,
  "children" | "title"
> & {
  label: string
  value: string
  sub?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

/**
 * Label, big tabular figure, optional extra (a meter), muted sub line.
 * Domain copy and status colors stay in the app. Other props go to the
 * root `div`; parts carry `data-slot="stat-tile-label|value|sub"`.
 */
function StatTile({
  label,
  value,
  sub,
  children,
  className,
  ...props
}: StatTileProps) {
  return (
    <div
      data-slot="stat-tile"
      className={cn("flex flex-col gap-1 px-3 py-2", className)}
      {...props}
    >
      <span data-slot="stat-tile-label" className={sectionLabel}>
        {label}
      </span>
      <span
        data-slot="stat-tile-value"
        className="text-lg font-semibold tracking-tight tabular-nums"
      >
        {value}
      </span>
      {children}
      {sub ? (
        <span
          data-slot="stat-tile-sub"
          className="text-xs leading-snug text-muted-foreground"
        >
          {sub}
        </span>
      ) : null}
    </div>
  )
}

export { StatTile }
