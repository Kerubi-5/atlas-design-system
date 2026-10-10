import { describe, expect, it } from "vitest"

import { ColorLegend } from "../src/color-legend.js"

import { render, screen } from "./helpers.js"

describe("ColorLegend", () => {
  it("renders a titled scale without attribution", () => {
    render(
      <ColorLegend
        title="Depth"
        aria-label="Flood depth"
        caption="Heights in metres"
        items={[
          { color: "#1d4ed8", range: "2+", label: "Deep" },
          { color: "#93c5fd", range: "0–2", label: "Shallow" },
        ]}
      >
        <span>Custom note</span>
      </ColorLegend>
    )

    const figure = screen.getByRole("figure", { name: "Flood depth" })
    expect(figure).toHaveAttribute("data-slot", "color-legend")
    expect(screen.getByText("Depth")).toBeInTheDocument()
    expect(screen.getByText("2+")).toBeInTheDocument()
    expect(screen.getByText("Deep")).toBeInTheDocument()
    expect(screen.getByText("Heights in metres")).toBeInTheDocument()
    expect(screen.getByText("Custom note")).toBeInTheDocument()
    expect(figure.textContent).not.toMatch(/Ookla|license|©/i)

    const swatch = figure.querySelector("span[aria-hidden]")
    expect(swatch).toHaveStyle({ backgroundColor: "rgb(29, 78, 216)" })
  })
})
