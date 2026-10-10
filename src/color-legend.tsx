import type * as React from "react"

import { cn } from "./utils.js"

export type ColorLegendItem = {
  /** CSS color from the app (map bins, status scales). The kit does not own it. */
  color: string
  range?: string
  label: string
}

export type ColorLegendProps = {
  title?: string
  items: ColorLegendItem[]
  caption?: React.ReactNode
  children?: React.ReactNode
  "aria-label"?: string
  className?: string
}

/**
 * Key for a color scale: swatch, optional range, and label. Overlay chrome
 * (absolute position, card fill) is the caller's `className`. Attribution
 * and license lines stay in the app.
 */
function ColorLegend({
  title,
  items,
  caption,
  children,
  "aria-label": ariaLabel,
  className,
}: ColorLegendProps) {
  return (
    <figure
      data-slot="color-legend"
      aria-label={ariaLabel}
      className={cn("flex flex-col gap-2 text-sm", className)}
    >
      {title ? (
        <figcaption className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {title}
        </figcaption>
      ) : null}
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={`${item.color}-${item.range ?? ""}-${item.label}`}
            className="flex items-center gap-2"
          >
            <span
              aria-hidden
              className="size-3.5 shrink-0 border border-input"
              style={{ backgroundColor: item.color }}
            />
            {item.range ? (
              <span className="w-16 shrink-0 tabular-nums text-muted-foreground">
                {item.range}
              </span>
            ) : null}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      {caption ? (
        <p className="text-xs text-muted-foreground">{caption}</p>
      ) : null}
      {children}
    </figure>
  )
}

export { ColorLegend }
