import { fireEvent } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  ChartLegend,
  ChartLegendKey,
  ChartTooltip,
  ChartTooltipRow,
  ChartYAxisGrid,
  chartFrame,
  compactNumber,
  indexAtPlotX,
  linePath,
  niceCeil,
  niceTicks,
  roundedTopBarPath,
  scaleLinear,
  stepIndex,
  useChartScrub,
  type ChartFrame,
} from "../src/chart.js"

import { render, screen } from "./helpers.js"

describe("chartFrame", () => {
  it("derives the plot box from the view size and padding", () => {
    const frame = chartFrame(200)
    expect(frame).toMatchObject({
      width: 640,
      height: 200,
      left: 40,
      top: 10,
      right: 628,
      bottom: 180,
      plotWidth: 588,
      plotHeight: 170,
      viewBox: "0 0 640 200",
    })
    expect(
      chartFrame(100, { width: 300, padding: { left: 0, right: 0 } })
    ).toMatchObject({ plotWidth: 300, left: 0, top: 10, plotHeight: 70 })
  })
})

describe("niceCeil", () => {
  it("rounds up to 1/2/2.5/4/5 steps", () => {
    expect(niceCeil(57_694)).toBe(100_000)
    expect(niceCeil(48_000)).toBe(50_000)
    expect(niceCeil(20_000)).toBe(20_000)
    expect(niceCeil(21_000)).toBe(25_000)
    expect(niceCeil(9)).toBe(10)
    expect(niceCeil(26)).toBe(40)
    expect(niceCeil(0)).toBe(1)
  })
})

describe("niceTicks", () => {
  it("spans 0..ceiling evenly", () => {
    expect(niceTicks(48_000)).toEqual([0, 12_500, 25_000, 37_500, 50_000])
    expect(niceTicks(9, 2)).toEqual([0, 5, 10])
  })
})

describe("scaleLinear", () => {
  it("maps domain onto range and survives a zero domain", () => {
    expect(scaleLinear(100, 500)(50)).toBe(250)
    expect(scaleLinear(0, 500)(10)).toBe(0)
  })
})

describe("linePath", () => {
  it("builds an SVG path with rounded coordinates", () => {
    expect(
      linePath([
        { x: 0, y: 10.567 },
        { x: 5.123, y: 8 },
      ])
    ).toBe("M 0 10.57 L 5.12 8")
    expect(linePath([])).toBe("")
  })
})

describe("compactNumber", () => {
  it("shortens thousands and millions", () => {
    expect(compactNumber(1_500)).toBe("1.5k")
    expect(compactNumber(50_000)).toBe("50k")
    expect(compactNumber(2_000_000)).toBe("2M")
    expect(compactNumber(950)).toBe("950")
  })
})

describe("roundedTopBarPath", () => {
  it("caps the radius at half the width and the bar height", () => {
    expect(roundedTopBarPath(0, 0, 4, 100)).toContain("Q 0 0 2 0")
    expect(roundedTopBarPath(0, 98, 24, 2)).toContain("Q 0 98 2 98")
  })

  it("starts and ends at the square baseline", () => {
    const d = roundedTopBarPath(10, 20, 20, 30)
    expect(d.startsWith("M 10 50")).toBe(true)
    expect(d.endsWith("L 30 50 Z")).toBe(true)
  })
})

describe("indexAtPlotX", () => {
  const frame = chartFrame(200)

  it("maps the plot edges to the first and last step", () => {
    expect(
      indexAtPlotX(frame.left, frame, { steps: 29, min: 1, max: 30 })
    ).toBe(1)
    expect(
      indexAtPlotX(frame.right, frame, { steps: 29, min: 1, max: 30 })
    ).toBe(30)
  })

  it("rounds to the nearest step and clamps to [min, max]", () => {
    const mid = frame.left + frame.plotWidth / 2
    expect(indexAtPlotX(mid, frame, { steps: 10, min: 0, max: 10 })).toBe(5)
    expect(indexAtPlotX(0, frame, { steps: 29, min: 1, max: 12 })).toBe(1)
    expect(
      indexAtPlotX(frame.right, frame, { steps: 29, min: 1, max: 12 })
    ).toBe(12)
  })
})

describe("stepIndex", () => {
  it("starts at min from no selection and stops at the ends", () => {
    expect(stepIndex(null, 1, { min: 1, max: 5 })).toBe(1)
    expect(stepIndex(null, -1, { min: 0, max: 5 })).toBe(0)
    expect(stepIndex(2, 1, { min: 1, max: 5 })).toBe(3)
    expect(stepIndex(5, 1, { min: 1, max: 5 })).toBe(5)
    expect(stepIndex(1, -1, { min: 1, max: 5 })).toBe(1)
  })
})

describe("ChartYAxisGrid", () => {
  it("draws one gridline and label per nice tick", () => {
    const frame = chartFrame(200)
    const { container } = render(
      <svg viewBox={frame.viewBox}>
        <ChartYAxisGrid frame={frame} yMax={48_000} />
      </svg>
    )
    const labels = [...container.querySelectorAll("text")].map(
      (t) => t.textContent
    )
    expect(labels).toEqual(["0", "12.5k", "25k", "37.5k", "50k"])
    const lines = container.querySelectorAll("line")
    expect(lines[0]).toHaveAttribute("y1", "180")
    expect(lines[4]).toHaveAttribute("y1", "10")
    expect(lines[0]).toHaveAttribute("x2", "628")
  })

  it("takes its own tick count and label format", () => {
    const frame = chartFrame(100)
    const { container } = render(
      <svg>
        <ChartYAxisGrid
          frame={frame}
          yMax={10}
          tickCount={2}
          format={(n) => `$${n}`}
        />
      </svg>
    )
    expect(
      [...container.querySelectorAll("text")].map((t) => t.textContent)
    ).toEqual(["$0", "$5", "$10"])
  })
})

describe("ChartTooltip", () => {
  it("anchors right of the point and flips left past the middle", () => {
    const { rerender } = render(
      <ChartTooltip xPct={20} yPct={80} className="min-w-40">
        <ChartTooltipRow
          label="spent"
          value="$10"
          swatchClassName="stroke-primary"
        />
      </ChartTooltip>
    )
    const tip = screen.getByRole("status")
    expect(tip).toHaveAttribute("data-slot", "chart-tooltip")
    expect(tip).toHaveClass("min-w-40")
    expect(tip.style.left).toBe("20%")
    expect(tip.style.top).toBe("60%")
    expect(tip.style.transform).toBe("translateX(12px)")
    expect(screen.getByText("$10")).toHaveClass("font-semibold")

    rerender(
      <ChartTooltip xPct={80} yPct={10}>
        <ChartTooltipRow label="even" value="$5" swatchClassName="x" dashed />
      </ChartTooltip>
    )
    expect(screen.getByRole("status").style.transform).toBe(
      "translateX(calc(-100% - 12px))"
    )
    expect(
      document.querySelector('[data-slot="chart-tooltip-row"] line')
    ).toHaveAttribute("stroke-dasharray", "3 2")
  })
})

describe("ChartLegend", () => {
  it("lists solid and dashed keys", () => {
    render(
      <ChartLegend className="gap-x-6">
        <ChartLegendKey swatchClassName="stroke-primary" label="Spent" />
        <ChartLegendKey
          swatchClassName="stroke-destructive"
          label="Limit"
          dashed
        />
      </ChartLegend>
    )
    const legend = document.querySelector('[data-slot="chart-legend"]')
    expect(legend).toHaveClass("gap-x-6", "text-xs")
    const keys = document.querySelectorAll('[data-slot="chart-legend-key"]')
    expect(keys).toHaveLength(2)
    expect(keys[0]).toHaveTextContent("Spent")
    expect(keys[0]!.querySelector("line")).not.toHaveAttribute(
      "stroke-dasharray"
    )
    expect(keys[1]!.querySelector("line")).toHaveAttribute(
      "stroke-dasharray",
      "3 2"
    )
  })
})

function ScrubProbe({ frame }: { frame: ChartFrame }) {
  const scrub = useChartScrub({ frame, steps: 10, min: 0, max: 8 })
  return (
    <>
      <svg
        ref={scrub.svgRef}
        data-testid="plot"
        tabIndex={0}
        onPointerMove={scrub.onPointerMove}
        onPointerLeave={scrub.clear}
        onKeyDown={scrub.onKeyDown}
      />
      <output>{scrub.index ?? "none"}</output>
    </>
  )
}

describe("useChartScrub", () => {
  it("picks an index from the pointer and arrow keys, and clears", () => {
    const frame = chartFrame(100, {
      width: 100,
      padding: { left: 0, right: 0 },
    })
    render(<ScrubProbe frame={frame} />)
    const plot = screen.getByTestId("plot")
    const output = screen.getByRole("status")
    plot.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect

    fireEvent.pointerMove(plot, { clientX: 100 })
    expect(output).toHaveTextContent("5")
    fireEvent.pointerMove(plot, { clientX: 200 })
    expect(output).toHaveTextContent("8")

    fireEvent.keyDown(plot, { key: "ArrowLeft" })
    expect(output).toHaveTextContent("7")
    fireEvent.keyDown(plot, { key: "ArrowRight" })
    expect(output).toHaveTextContent("8")
    fireEvent.keyDown(plot, { key: "Escape" })
    expect(output).toHaveTextContent("none")
    fireEvent.keyDown(plot, { key: "ArrowRight" })
    expect(output).toHaveTextContent("0")
    fireEvent.keyDown(plot, { key: "a" })
    expect(output).toHaveTextContent("0")
    fireEvent.pointerLeave(plot)
    expect(output).toHaveTextContent("none")
  })
})
