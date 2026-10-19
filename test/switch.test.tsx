import { describe, expect, it, vi } from "vitest"

import { Label } from "../src/label.js"
import { Switch } from "../src/switch.js"

import { createUser, render, screen } from "./helpers.js"

describe("Switch", () => {
  it("toggles from its label and exposes the switch role", async () => {
    const user = createUser()
    const onCheckedChange = vi.fn()
    render(
      <>
        <Switch id="digest" onCheckedChange={onCheckedChange} />
        <Label htmlFor="digest">Weekly digest</Label>
      </>
    )

    const toggle = screen.getByRole("switch", { name: "Weekly digest" })
    expect(toggle).toHaveAttribute("aria-checked", "false")
    expect(toggle.className).toContain("rounded-none")
    // The 20px track gets the enlarged hit area Checkbox and Radio use.
    expect(toggle.className).toContain("after:-inset-y-2")

    await user.click(screen.getByText("Weekly digest"))
    expect(toggle).toHaveAttribute("aria-checked", "true")
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)

    await user.keyboard(" ")
    expect(toggle).toHaveAttribute("aria-checked", "false")
  })
})
