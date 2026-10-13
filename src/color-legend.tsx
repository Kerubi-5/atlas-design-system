import type * as React from "react"

import { sectionLabel } from "./internal/styles.js"
import { cn } from "./utils.js"

export type ColorLegendItem = {
  /** CSS color from the app (map bins, status scales). The kit does not own it. */
  color: string
  range?: string
  label: string
}

export type ColorLegendProps = Omit<
  React.ComponentProps<"figure">,
  "children" | "title"
> & {
  title?: string
  items: ColorLegendItem[]
  caption?: React.ReactNode
  children?: React.ReactNode
  "aria-label"?: string
  className?: string
}

/**
 * Key for a color scale: swatch, optional range, and label. Overlay chrome
 * (absolute position, card fill) is the caller's `className`; other props go
 * to the `figure`. Parts carry `data-slot="color-legend-*"` (title, list,
 * item, swatch, range, label, caption). Attribution and license lines stay
 * in the app.
 */
function ColorLegend({
  title,
  items,
  caption,
  children,
  className,
  ...props
}: ColorLegendProps) {
  return (
    <figure
      data-slot="color-legend"
      className={cn("flex flex-col gap-2 text-sm", className)}
      {...props}
    >
      {title ? (
        <figcaption
          data-slot="color-legend-title"
          className={cn("font-heading", sectionLabel)}
        >
          {title}
        </figcaption>
      ) : null}
      <ul data-slot="color-legend-list" className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={`${item.color}-${item.range ?? ""}-${item.label}`}
            data-slot="color-legend-item"
            className="flex items-center gap-2"
          >
            <span
              aria-hidden
              data-slot="color-legend-swatch"
              className="size-3.5 shrink-0 border border-input"
              style={{ backgroundColor: item.color }}
            />
            {item.range ? (
              <span
                data-slot="color-legend-range"
                className="w-16 shrink-0 tabular-nums text-muted-foreground"
              >
                {item.range}
              </span>
            ) : null}
            <span data-slot="color-legend-label">{item.label}</span>
          </li>
        ))}
      </ul>
      {caption ? (
        <p
          data-slot="color-legend-caption"
          className="text-xs text-muted-foreground"
        >
          {caption}
        </p>
      ) : null}
      {children}
    </figure>
  )
}

export { ColorLegend }
