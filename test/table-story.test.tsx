import { expect, it } from "vitest"

import { TableStory } from "../stories/data.js"
import { createUser, render, screen, within } from "./helpers.js"

it("sorts Region and numeric Count in both directions while preserving selection", async () => {
  const user = createUser()
  render(<TableStory />)
  const regions = () =>
    screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell")[0]?.textContent)
  const expectRows = (expected: string[]) => {
    expect(regions()).toEqual(expected)
    expect(screen.getByRole("row", { name: "North 128" })).toHaveAttribute(
      "data-state",
      "selected"
    )
    expect(screen.getByRole("row", { name: "East 64" })).not.toHaveAttribute(
      "data-state"
    )
  }
  expectRows(["East", "North"])
  await user.click(screen.getByRole("button", { name: /Region/ }))
  expectRows(["North", "East"])
  await user.click(screen.getByRole("button", { name: /Region/ }))
  expectRows(["East", "North"])
  await user.click(screen.getByRole("button", { name: /Count/ }))
  expectRows(["East", "North"])
  await user.click(screen.getByRole("button", { name: /Count/ }))
  expectRows(["North", "East"])
})
