import { describe, expect, it } from "vitest"

import { Badge } from "../src/badge.js"
import { InfoTip, InlineTip } from "../src/info-tip.js"

import {
  createUser,
  render,
  screen,
  stubMatchMedia,
  waitFor,
} from "./helpers.js"

describe("InfoTip", () => {
  it("names the glyph and opens a popover from click", async () => {
    const user = createUser()
    render(
      <InfoTip
        label="About flood depth"
        title="Depth"
        description="Height of standing water."
        badge={
          <Badge variant="soft" tone="neutral">
            Scale
          </Badge>
        }
      >
        Extra detail
      </InfoTip>
    )

    const trigger = screen.getByRole("button", { name: "About flood depth" })
    expect(trigger).toHaveAttribute("data-layout", "box")
    expect(trigger.className.split(/\s+/)).toContain("size-11")

    await user.click(trigger)
    expect(await screen.findByText("Depth")).toBeVisible()
    expect(screen.getByText("Height of standing water.")).toBeVisible()
    expect(screen.getByText("Extra detail")).toBeVisible()
    expect(screen.getByText("Scale")).toBeVisible()
  })

  it("keeps inline layout from stretching the line box", () => {
    render(
      <p>
        Depth
        <InlineTip label="What depth means" title="Depth" />
      </p>
    )

    const trigger = screen.getByRole("button", { name: "What depth means" })
    expect(trigger).toHaveAttribute("data-layout", "inline")
    expect(trigger.className.split(/\s+/)).toContain("size-5")
    expect(trigger.className).toMatch(/after:size-11/)
  })

  it("opens on hover only when the pointer can hover", async () => {
    const restore = stubMatchMedia(
      (query) =>
        query.includes("(hover: hover)") && query.includes("(pointer: fine)")
    )
    const user = createUser()
    render(<InfoTip label="Hint" title="Hint title" />)

    await user.hover(screen.getByRole("button", { name: "Hint" }))
    expect(await screen.findByText("Hint title")).toBeVisible()
    restore()
  })

  it("stays open after a click when the pointer leaves", async () => {
    const restore = stubMatchMedia(
      (query) =>
        query.includes("(hover: hover)") && query.includes("(pointer: fine)")
    )
    const user = createUser()
    render(
      <div>
        <InfoTip label="Hint" title="Hint title" description="Longer help." />
        <button type="button">Away</button>
      </div>
    )

    await user.click(screen.getByRole("button", { name: "Hint" }))
    expect(await screen.findByText("Hint title")).toBeVisible()
    await user.hover(screen.getByRole("button", { name: "Away" }))
    expect(screen.getByText("Hint title")).toBeVisible()
    restore()
  })

  it("does not open on hover for a coarse pointer", async () => {
    const restore = stubMatchMedia(false)
    const user = createUser()
    render(<InfoTip label="Hint" title="Hint title" />)

    await user.hover(screen.getByRole("button", { name: "Hint" }))
    await waitFor(() => {
      expect(screen.queryByText("Hint title")).not.toBeInTheDocument()
    })
    restore()
  })
})
