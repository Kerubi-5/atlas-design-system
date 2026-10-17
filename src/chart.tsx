"use client"

import * as React from "react"

import { clamp } from "./internal/math.js"
import { overlaySurface } from "./internal/overlay-styles.js"
import { cn } from "./utils.js"

/**
 * Building blocks for small SVG charts: a plot frame in viewBox units, axis
 * math, a gridline axis, a tooltip, a legend, and pointer/arrow-key
 * scrubbing. The chart itself (bars, lines, what they mean) stays in the
 * app; these pieces keep every chart's axis, readout, and keyboard use alike.
 */

export type ChartPadding = {
  top: number
  right: number
  bottom: number
  left: number
}

/** Room for compact y labels on the left and x labels underneath. */
const defaultPadding: ChartPadding = {
  top: 10,
  right: 12,
  bottom: 20,
  left: 40,
}

/** A chart's viewBox and the plot box inside it, in viewBox units. */
export type ChartFrame = {
  width: number
  height: number
  viewBox: string
  /** Plot edges: `left`/`right` on x, `top` and `bottom` (the baseline) on y. */
  left: number
  right: number
  top: number
  bottom: number
  plotWidth: number
  plotHeight: number
}

/**
 * Frame for a chart `height` units tall. Charts that share a `width` and
 * padding line up when stacked. The SVG scales to its box, so these are
 * viewBox units, not pixels.
 */
export function chartFrame(
  height: number,
  {
    width = 640,
    padding,
  }: { width?: number; padding?: Partial<ChartPadding> } = {}
): ChartFrame {
  const pad = { ...defaultPadding, ...padding }
  const plotWidth = width - pad.left - pad.right
  const plotHeight = height - pad.top - pad.bottom
  return {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    left: pad.left,
    right: pad.left + plotWidth,
    top: pad.top,
    bottom: pad.top + plotHeight,
    plotWidth,
    plotHeight,
  }
}

/**
 * Round `max` up to a clean axis ceiling (1, 2, 2.5, 4, or 5 × 10^n). The 4
 * step keeps a value just past 25 off a half-empty 50 axis.
 */
export function niceCeil(max: number): number {
  if (max <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(max))
  for (const step of [1, 2, 2.5, 4, 5]) {
    if (max <= step * pow) return step * pow
  }
  return 10 * pow
}

/** `count` even steps from 0 to `niceCeil(max)`, both ends included. */
export function niceTicks(max: number, count = 4): number[] {
  const top = niceCeil(max)
  return Array.from({ length: count + 1 }, (_, i) => (top / count) * i)
}

/** Linear scale from [0, domainMax] onto [0, rangeMax]; a zero domain maps to 0. */
export function scaleLinear(domainMax: number, rangeMax: number) {
  return (value: number) =>
    domainMax === 0 ? 0 : (value / domainMax) * rangeMax
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** SVG path through the points (`M x y L x y …`); empty for no points. */
export function linePath(points: ReadonlyArray<{ x: number; y: number }>) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${round2(p.x)} ${round2(p.y)}`)
    .join(" ")
}

/**
 * A bar with a rounded data end and a square baseline. (x, y) is the top
 * left; the bar grows down to y + h. Pass `r = 0` for a square bar.
 */
export function roundedTopBarPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r = 4
): string {
  const rad = Math.min(r, w / 2, h)
  return [
    `M ${round2(x)} ${round2(y + h)}`,
    `L ${round2(x)} ${round2(y + rad)}`,
    `Q ${round2(x)} ${round2(y)} ${round2(x + rad)} ${round2(y)}`,
    `L ${round2(x + w - rad)} ${round2(y)}`,
    `Q ${round2(x + w)} ${round2(y)} ${round2(x + w)} ${round2(y + rad)}`,
    `L ${round2(x + w)} ${round2(y + h)}`,
    "Z",
  ].join(" ")
}

function trimZero(n: number): string {
  const fixed = n.toFixed(1)
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed
}

/** Short axis label: 1500 → "1.5k", 2000000 → "2M". */
export function compactNumber(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${trimZero(n / 1_000_000)}M`
  if (abs >= 1_000) return `${trimZero(n / 1_000)}k`
  return String(Math.round(n))
}

type IndexRange = { min: number; max: number }

/**
 * Data index at viewBox x `viewX`. The plot spans `steps` intervals from
 * `min`; the result is clamped to [min, max], so `max` can stop short of the
 * axis (days not reached yet).
 */
export function indexAtPlotX(
  viewX: number,
  frame: ChartFrame,
  { steps, min, max }: IndexRange & { steps: number }
): number {
  const index =
    Math.round(((viewX - frame.left) / frame.plotWidth) * steps) + min
  return clamp(index, min, max)
}

/** Arrow-key move by `delta`, clamped; with nothing picked it starts at `min`. */
export function stepIndex(
  current: number | null,
  delta: 1 | -1,
  { min, max }: IndexRange
): number {
  if (current === null) return min
  return clamp(current + delta, min, max)
}

/**
 * Crosshair state: the pointer or the arrow keys pick a data index in
 * [min, max], and Escape or leaving the plot clears it. Put `svgRef` and the
 * handlers on the chart's `<svg>`, which needs `tabIndex={0}`.
 */
export function useChartScrub({
  frame,
  steps,
  min,
  max,
}: {
  frame: ChartFrame
  steps: number
  min: number
  max: number
}) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [index, setIndex] = React.useState<number | null>(null)
  const clear = React.useCallback(() => setIndex(null), [])

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return
      const viewX = ((event.clientX - rect.left) / rect.width) * frame.width
      setIndex(indexAtPlotX(viewX, frame, { steps, min, max }))
    },
    [frame, steps, min, max]
  )

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const delta = event.key === "ArrowRight" ? 1 : -1
        setIndex((current) => stepIndex(current, delta, { min, max }))
        event.preventDefault()
      } else if (event.key === "Escape") {
        setIndex(null)
      }
    },
    [min, max]
  )

  return { svgRef, index, clear, onPointerMove, onKeyDown }
}

/**
 * Horizontal gridlines from 0 to `niceCeil(yMax)` with labels in the left
 * padding. Render inside the chart's `<svg>`.
 */
export function ChartYAxisGrid({
  frame,
  yMax,
  tickCount = 4,
  format = compactNumber,
}: {
  frame: ChartFrame
  yMax: number
  tickCount?: number
  format?: (value: number) => string
}) {
  const ticks = niceTicks(yMax, tickCount)
  const top = ticks[ticks.length - 1] ?? 1
  const y = (value: number) => frame.bottom - (value / top) * frame.plotHeight
  return (
    <g data-slot="chart-y-axis">
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={frame.left}
            y1={y(tick)}
            x2={frame.right}
            y2={y(tick)}
            strokeWidth={1}
            className="stroke-border"
          />
          <text
            x={frame.left - 6}
            y={y(tick) + 3}
            textAnchor="end"
            className="fill-muted-foreground text-[10px] tabular-nums"
          >
            {format(tick)}
          </text>
        </g>
      ))}
    </g>
  )
}

/**
 * Readout for the hovered or focused point, placed in percent of the chart
 * box (its wrapper must be `relative`). It sits right of the point and
 * flips left past 55% so it does not clip at the edge.
 */
export function ChartTooltip({
  xPct,
  yPct,
  className,
  style,
  children,
  ...props
}: {
  xPct: number
  yPct: number
} & React.ComponentProps<"div">) {
  const flip = xPct > 55
  return (
    <div
      role="status"
      data-slot="chart-tooltip"
      className={cn(
        overlaySurface,
        "pointer-events-none absolute z-10 min-w-32 px-2.5 py-2 text-xs",
        className
      )}
      style={{
        left: `${xPct}%`,
        top: `${Math.min(yPct, 60)}%`,
        transform: flip ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

function SeriesSwatch({
  width,
  strokeWidth,
  dashed,
  className,
}: {
  width: number
  strokeWidth: number
  dashed?: boolean
  className: string
}) {
  return (
    <svg width={width} height="4" aria-hidden className="shrink-0">
      <line
        x1="0"
        y1="2"
        x2={width}
        y2="2"
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? "3 2" : undefined}
        className={className}
      />
    </svg>
  )
}

/** Tooltip row: the value leads, the label follows, keyed by the series stroke. */
export function ChartTooltipRow({
  label,
  value,
  swatchClassName,
  dashed,
}: {
  label: React.ReactNode
  value: React.ReactNode
  /** The series stroke, e.g. `stroke-primary`. */
  swatchClassName: string
  dashed?: boolean
}) {
  return (
    <div
      data-slot="chart-tooltip-row"
      className="flex items-center gap-2 py-0.5"
    >
      <SeriesSwatch
        width={14}
        strokeWidth={2.5}
        dashed={dashed}
        className={swatchClassName}
      />
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

/** Row of legend keys under a chart. */
export function ChartLegend({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chart-legend"
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/** One legend entry: a solid or dashed line swatch and its label. */
export function ChartLegendKey({
  label,
  swatchClassName,
  dashed,
  className,
}: {
  label: React.ReactNode
  /** The series stroke, e.g. `stroke-primary`. */
  swatchClassName: string
  dashed?: boolean
  className?: string
}) {
  return (
    <span
      data-slot="chart-legend-key"
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <SeriesSwatch
        width={16}
        strokeWidth={2}
        dashed={dashed}
        className={swatchClassName}
      />
      {label}
    </span>
  )
}
