import { describe, expect, it } from "vitest"

import { Meter } from "../src/meter.js"
import { StatTile, sectionLabel, statTileGrid } from "../src/stat-tile.js"

import { render, screen } from "./helpers.js"

describe("StatTile", () => {
  it("renders label, value, sub, and children", () => {
    render(
      <div className={statTileGrid}>
        <StatTile label="Spent" value="1,240" sub="of 2,000">
          <Meter value={1240} max={2000} aria-label="Spent of limit" />
        </StatTile>
      </div>
    )

    expect(screen.getByText("Spent")).toHaveClass(...sectionLabel.split(/\s+/))
    expect(screen.getByText("1,240").className).toMatch(/tabular-nums/)
    expect(screen.getByText("of 2,000")).toBeInTheDocument()
    expect(
      screen.getByRole("meter", { name: "Spent of limit" })
    ).toBeInTheDocument()
    expect(statTileGrid).toMatch(/sm:divide-x/)
  })
})
