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

const finePointer = (query: string) =>
  query.includes("(hover: hover)") && query.includes("(pointer: fine)")

/** Wait until the "Hint title" panel is gone (or never opened). */
function hintClosed() {
  return waitFor(() => {
    expect(screen.queryByText("Hint title")).not.toBeInTheDocument()
  })
}

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
    expect(trigger).toHaveClass("size-11")

    await user.click(trigger)
    expect(await screen.findByText("Depth")).toBeVisible()
    expect(screen.getByText("Height of standing water.")).toBeVisible()
    expect(screen.getByText("Extra detail")).toBeVisible()
    expect(screen.getByText("Scale")).toBeVisible()
  })

  it("names the dialog from its title, or from the label without one", async () => {
    const user = createUser()
    const { unmount } = render(
      <InfoTip label="About depth" title="Depth" description="Water." />
    )
    await user.click(screen.getByRole("button", { name: "About depth" }))
    expect(await screen.findByRole("dialog")).toHaveAccessibleName("Depth")
    unmount()

    render(<InfoTip label="About depth" description="Water." />)
    await user.click(screen.getByRole("button", { name: "About depth" }))
    expect(await screen.findByRole("dialog")).toHaveAccessibleName(
      "About depth"
    )
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
    expect(trigger).toHaveClass("size-[1em]")
    expect(trigger.className).toMatch(/after:size-11/)
  })

  it("opens on hover when the pointer can hover, and closes on the first Escape", async () => {
    stubMatchMedia(finePointer)
    const user = createUser()
    render(<InfoTip label="Hint" title="Hint title" />)

    await user.hover(screen.getByRole("button", { name: "Hint" }))
    expect(await screen.findByText("Hint title")).toBeVisible()

    await user.keyboard("{Escape}")
    await hintClosed()
  })

  it("closes a click-pinned panel on Escape and returns focus to the glyph", async () => {
    stubMatchMedia(finePointer)
    const user = createUser()
    render(<InfoTip label="Hint" title="Hint title" />)

    const trigger = screen.getByRole("button", { name: "Hint" })
    await user.click(trigger)
    expect(await screen.findByText("Hint title")).toBeVisible()

    await user.keyboard("{Escape}")
    await hintClosed()
    expect(trigger).toHaveFocus()
  })

  it("keeps focus in the field being typed in when hover opens the panel", async () => {
    stubMatchMedia(finePointer)
    const user = createUser()
    render(
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" />
        <InfoTip label="Hint" title="Hint title" />
      </div>
    )

    const field = screen.getByLabelText("Name")
    await user.click(field)
    await user.keyboard("Ada")

    await user.hover(screen.getByRole("button", { name: "Hint" }))
    expect(await screen.findByText("Hint title")).toBeVisible()
    expect(field).toHaveFocus()

    await user.keyboard("{Escape}")
    await hintClosed()
    expect(field).toHaveFocus()
  })

  it("stays open after a click when the pointer leaves", async () => {
    stubMatchMedia(finePointer)
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
  })

  it("does not open on hover for a coarse pointer", async () => {
    stubMatchMedia(false)
    const user = createUser()
    render(<InfoTip label="Hint" title="Hint title" />)

    await user.hover(screen.getByRole("button", { name: "Hint" }))
    await hintClosed()
  })
})
