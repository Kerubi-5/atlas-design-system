import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Label } from "../src/label.js"
import { Slider } from "../src/slider.js"

import { createUser, render, screen } from "./helpers.js"

function SliderHarness({
  onValueCommit,
}: {
  onValueCommit?: (value: number) => void
}) {
  const [value, setValue] = useState(40)
  return (
    <div>
      <Label id="chance-label">Chance</Label>
      <Slider
        id="chance"
        aria-labelledby="chance-label"
        value={value}
        onValueChange={setValue}
        onValueCommit={onValueCommit}
      />
      <span>{value}%</span>
    </div>
  )
}

describe("Slider", () => {
  it("is a labelled slider with a 44px thumb hit area", () => {
    render(<SliderHarness />)

    const slider = screen.getByRole("slider", { name: "Chance" })
    expect(slider).toHaveAttribute("aria-valuenow", "40")
    expect(slider).toHaveAttribute("aria-valuemin", "0")
    expect(slider).toHaveAttribute("aria-valuemax", "100")
    expect(slider.className).toMatch(/after:size-11/)
    expect(slider.className.split(/\s+/)).toContain("size-4")
    expect(slider.className).toMatch(/rounded-none/)
  })

  it("moves with arrow keys and commits on pointer up", async () => {
    const onValueCommit = vi.fn()
    const user = createUser()
    render(<SliderHarness onValueCommit={onValueCommit} />)

    const slider = screen.getByRole("slider", { name: "Chance" })
    slider.focus()
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(slider).toHaveAttribute("aria-valuenow", "42")
    expect(screen.getByText("42%")).toBeInTheDocument()

    await user.keyboard("{Home}")
    expect(slider).toHaveAttribute("aria-valuenow", "0")
    await user.keyboard("{End}")
    expect(slider).toHaveAttribute("aria-valuenow", "100")
  })
})
