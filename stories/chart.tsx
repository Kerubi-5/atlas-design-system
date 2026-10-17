import {
  ChartLegend,
  ChartLegendKey,
  ChartTooltip,
  ChartTooltipRow,
  ChartYAxisGrid,
  chartFrame,
  linePath,
  niceCeil,
  useChartScrub,
} from "../src/chart.js"

const frame = chartFrame(200)
const spent = [0, 120, 180, 420, 460, 610, 700, 890, 940, 1_180, 1_240]
const days = spent.length
const limit = 1_500
const yMax = niceCeil(limit)
const x = (day: number) => frame.left + (day / (days - 1)) * frame.plotWidth
const y = (value: number) => frame.bottom - (value / yMax) * frame.plotHeight

/** A cumulative-spend line with a limit, crosshair, tooltip, and legend. */
export function ChartStory() {
  const scrub = useChartScrub({ frame, steps: days - 1, min: 0, max: days - 1 })
  const hovered = scrub.index
  return (
    <figure className="flex max-w-xl flex-col gap-1.5">
      <div className="relative">
        <svg
          ref={scrub.svgRef}
          viewBox={frame.viewBox}
          className="w-full touch-none select-none"
          role="img"
          aria-label="Spending by day: 1,240 of a 1,500 limit. Use arrow keys to inspect days."
          tabIndex={0}
          onPointerMove={scrub.onPointerMove}
          onPointerLeave={scrub.clear}
          onKeyDown={scrub.onKeyDown}
        >
          <ChartYAxisGrid frame={frame} yMax={limit} />
          <line
            x1={frame.left}
            x2={frame.right}
            y1={y(limit)}
            y2={y(limit)}
            strokeDasharray="5 4"
            strokeWidth={1.5}
            className="stroke-destructive/70"
          />
          <path
            d={linePath(spent.map((v, day) => ({ x: x(day), y: y(v) })))}
            fill="none"
            strokeWidth={2}
            className="stroke-primary"
          />
          {hovered !== null ? (
            <line
              x1={x(hovered)}
              x2={x(hovered)}
              y1={frame.top}
              y2={frame.bottom}
              className="stroke-foreground/30"
            />
          ) : null}
        </svg>
        {hovered !== null ? (
          <ChartTooltip
            xPct={(x(hovered) / frame.width) * 100}
            yPct={(y(spent[hovered] ?? 0) / frame.height) * 100}
          >
            <p className="pb-1 font-medium">Day {hovered + 1}</p>
            <ChartTooltipRow
              value={(spent[hovered] ?? 0).toLocaleString()}
              label="spent to date"
              swatchClassName="stroke-primary"
            />
          </ChartTooltip>
        ) : null}
      </div>
      <ChartLegend>
        <ChartLegendKey swatchClassName="stroke-primary" label="Spent" />
        <ChartLegendKey
          swatchClassName="stroke-destructive/70"
          label="Limit"
          dashed
        />
      </ChartLegend>
    </figure>
  )
}
