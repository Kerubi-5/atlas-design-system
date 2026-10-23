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
      expect(button).toHaveClass("hover:bg-selected")
      expect(button.className.split(/\s+/)).toContain(
        "hover:text-selected-foreground"
      )
      expect(button.className.split(/\s+/)).toContain(
        "hover:border-selected-foreground"
      )
      // Focus is the shared solid ring, not a translucent glow (WCAG 1.4.11).
      expect(button).toHaveClass("focus-visible:ring-ring")
      expect(button).not.toHaveClass("hover:bg-muted")
    }

    const filled = screen.getByRole("button", { name: "default" })
    expect(filled).toHaveClass("hover:bg-primary/80")
    expect(filled).not.toHaveClass("hover:bg-selected")
  })

  it("keeps outline readable on a selected wash", () => {
    render(<OutlineOnSelectedStory />)
    const clear = screen.getByRole("button", { name: "Clear selection" })
    expect(clear).toHaveAttribute("data-variant", "outline")
    expect(clear).toHaveClass("hover:bg-selected")
    expect(clear).not.toHaveClass("hover:bg-muted")
    expect(clear.closest(".bg-selected")).toBeTruthy()
  })

  it("documents the hover chrome with a static story", () => {
    render(<QuietButtonHoverStory />)
    const hovered = screen.getByRole("button", { name: "Clear selection" })
    expect(hovered).toHaveClass(
      "border-ring",
      "bg-selected",
      "text-selected-foreground",
      "ring-ring"
    )
  })
})

describe("Button disabled", () => {
  it("dims every variant to half opacity with no pointer or hover", () => {
    for (const variant of [
      "default",
      "outline",
      "secondary",
      "ghost",
      "destructive",
      "link",
    ] as const) {
      const { unmount } = render(
        <Button variant={variant} disabled>
          {variant}
        </Button>
      )
      const tokens = screen
        .getByRole("button", { name: variant })
        .className.split(/\s+/)
      expect(tokens).toContain("disabled:opacity-50")
      expect(tokens).toContain("disabled:pointer-events-none")
      // 1.2.3 kept disabled buttons fully opaque and only desaturated them.
      expect(tokens).not.toContain("disabled:opacity-100")
      expect(tokens).not.toContain("disabled:saturate-0")
      unmount()
    }
  })
})
