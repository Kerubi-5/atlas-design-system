import { describe, expect, it } from "vitest"

import { Meter } from "../src/meter.js"

import { render, screen } from "./helpers.js"

describe("Meter", () => {
  it("exposes meter ARIA values and places markers on the value scale", () => {
    render(
      <Meter
        value={60}
        max={100}
        fillClassName="bg-warning"
        markers={[
          { position: 80 },
          { position: 40, className: "bg-foreground" },
        ]}
        aria-label="Spend against limit"
      />
    )

    const meter = screen.getByRole("meter", { name: "Spend against limit" })
    expect(meter).toHaveAttribute("aria-valuemin", "0")
    expect(meter).toHaveAttribute("aria-valuemax", "100")
    expect(meter).toHaveAttribute("aria-valuenow", "60")

    const fill = meter.querySelector("[data-slot=meter-fill]")
    expect(fill).toHaveClass("bg-warning")
    expect(fill).toHaveStyle({ width: "60%" })

    const markers = meter.querySelectorAll("[data-slot=meter-marker]")
    expect(markers).toHaveLength(2)
    expect(markers[0]).toHaveStyle({ left: "80%" })
    expect(markers[1]).toHaveStyle({ left: "40%" })
    expect(markers[1]).toHaveClass("bg-foreground")
  })

  it("clamps the fill and now value to min and max", () => {
    render(<Meter value={150} min={10} max={110} aria-label="Over" />)

    const meter = screen.getByRole("meter", { name: "Over" })
    expect(meter).toHaveAttribute("aria-valuenow", "110")
    expect(meter.querySelector("[data-slot=meter-fill]")).toHaveStyle({
      width: "100%",
    })
  })
})
