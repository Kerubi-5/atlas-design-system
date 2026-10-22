import { expect, it } from "vitest"

import { TableStory } from "../stories/data.js"
import { createUser, render, screen, within } from "./helpers.js"

it("sorts Region and numeric Count in both directions", async () => {
  const user = createUser()
  render(<TableStory />)
  const regions = () =>
    screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell")[0]?.textContent)
  expect(regions()).toEqual(["East", "North"])
  await user.click(screen.getByRole("button", { name: /Region/ }))
  expect(regions()).toEqual(["North", "East"])
  await user.click(screen.getByRole("button", { name: /Region/ }))
  expect(regions()).toEqual(["East", "North"])
  await user.click(screen.getByRole("button", { name: /Count/ }))
  expect(regions()).toEqual(["East", "North"])
  await user.click(screen.getByRole("button", { name: /Count/ }))
  expect(regions()).toEqual(["North", "East"])
})
