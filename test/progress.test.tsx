import { describe, expect, it } from "vitest"

import { Progress } from "../src/progress.js"

import { render, screen } from "./helpers.js"

const indicator = (bar: HTMLElement) =>
  bar.querySelector<HTMLElement>("[data-slot=progress-indicator]")!

// Found in the 1.0 audit; each case failed before its fix.
describe("Progress range", () => {
  it("draws the fill against max, matching what screen readers hear", () => {
    render(<Progress value={50} max={200} aria-label="Upload" />)
    const bar = screen.getByRole("progressbar", { name: "Upload" })
    expect(bar).toHaveAttribute("aria-valuetext", "25%")
    expect(indicator(bar).style.transform).toBe("translateX(-75%)")
  })

  it("clamps values past max instead of drawing an invalid transform", () => {
    render(<Progress value={120} aria-label="Over" />)
    const bar = screen.getByRole("progressbar", { name: "Over" })
    expect(bar).toHaveAttribute("aria-valuenow", "100")
    expect(indicator(bar).style.transform).toBe("translateX(-0%)")
  })

  it("treats NaN as indeterminate and draws an empty bar", () => {
    render(<Progress value={Number.NaN} aria-label="Broken" />)
    const bar = screen.getByRole("progressbar", { name: "Broken" })
    expect(bar).toHaveAttribute("data-state", "indeterminate")
    expect(indicator(bar).style.transform).toBe("translateX(-100%)")
  })
})
