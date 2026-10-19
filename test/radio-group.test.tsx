import { describe, expect, it, vi } from "vitest"

import { Label } from "../src/label.js"
import { RadioGroup, RadioGroupItem } from "../src/radio-group.js"

import { createUser, render, screen, waitFor } from "./helpers.js"

describe("RadioGroup", () => {
  it("moves the selection with arrow keys", async () => {
    const user = createUser()
    const onValueChange = vi.fn()
    render(
      <RadioGroup
        defaultValue="daily"
        onValueChange={onValueChange}
        aria-label="Frequency"
      >
        {["daily", "weekly", "monthly"].map((value) => (
          <div key={value}>
            <RadioGroupItem value={value} id={value} />
            <Label htmlFor={value}>{value}</Label>
          </div>
        ))}
      </RadioGroup>
    )

    expect(screen.getByRole("radiogroup", { name: "Frequency" })).toBeVisible()
    const daily = screen.getByRole("radio", { name: "daily" })
    expect(daily).toBeChecked()
    expect(daily.className).toContain("rounded-full")

    await user.click(daily)
    // Radix selects on focus only while the arrow key is held, and moves
    // focus asynchronously, so hold the key until the selection follows.
    await user.keyboard("{ArrowDown>}")
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "weekly" })).toBeChecked()
    })
    await user.keyboard("{/ArrowDown}")
    expect(onValueChange).toHaveBeenLastCalledWith("weekly")
  })
})
