import { describe, expect, it } from "vitest"

import { Button, quietButtonInteraction } from "../src/button.js"
import {
  ButtonVariantsStory,
  OutlineOnSelectedStory,
  QuietButtonHoverStory,
} from "../stories/button-hover.js"

import { render, screen } from "./helpers.js"

describe("Button quiet hover", () => {
  it("uses brand purple chrome instead of a muted grey fill", () => {
    for (const token of [
      "hover:border-selected-foreground",
      "hover:bg-selected",
      "hover:text-selected-foreground",
      "focus-visible:text-selected-foreground",
    ]) {
      expect(quietButtonInteraction.split(/\s+/)).toContain(token)
    }
    expect(quietButtonInteraction.split(/\s+/)).not.toContain("hover:bg-muted")

    render(<ButtonVariantsStory />)

    const outline = screen.getByRole("button", { name: "outline" })
    const ghost = screen.getByRole("button", { name: "ghost" })
    const clear = screen.getByRole("button", { name: "Clear selection" })

    for (const button of [outline, ghost, clear]) {
      expect(button.className.split(/\s+/)).toContain("hover:bg-selected")
      expect(button.className.split(/\s+/)).toContain(
        "hover:text-selected-foreground"
      )
      expect(button.className.split(/\s+/)).toContain(
        "hover:border-selected-foreground"
      )
      // Focus is the shared solid ring, not a translucent glow (WCAG 1.4.11).
      expect(button.className.split(/\s+/)).toContain("focus-visible:ring-ring")
      expect(button.className.split(/\s+/)).not.toContain("hover:bg-muted")
    }

    const filled = screen.getByRole("button", { name: "default" })
    expect(filled.className.split(/\s+/)).toContain("hover:bg-primary/80")
    expect(filled.className.split(/\s+/)).not.toContain("hover:bg-selected")
  })

  it("keeps outline readable on a selected wash", () => {
    render(<OutlineOnSelectedStory />)
    const clear = screen.getByRole("button", { name: "Clear selection" })
    expect(clear).toHaveAttribute("data-variant", "outline")
    expect(clear.className.split(/\s+/)).toContain("hover:bg-selected")
    expect(clear.className.split(/\s+/)).not.toContain("hover:bg-muted")
    expect(clear.closest(".bg-selected")).toBeTruthy()
  })

  it("documents the hover chrome with a static story", () => {
    render(<QuietButtonHoverStory />)
    const hovered = screen.getByRole("button", { name: "Clear selection" })
    expect(hovered.className.split(/\s+/)).toContain("border-ring")
    expect(hovered.className.split(/\s+/)).toContain("bg-selected")
    expect(hovered.className.split(/\s+/)).toContain("text-selected-foreground")
    expect(hovered.className.split(/\s+/)).toContain("ring-ring")
  })
})
