import { describe, expect, it } from "vitest"

import { selectedToggleChrome, Toggle, toggleVariants } from "../src/toggle.js"
import { ToggleGroup, ToggleGroupItem } from "../src/toggle-group.js"

import { createUser, render, screen } from "./helpers.js"

/** Selected wash, text, and border must apply for every Radix selection attr. */
const selectedChrome = [
  "data-on:bg-selected",
  "data-on:text-selected-foreground",
  "data-on:border-selected-foreground",
  "aria-pressed:bg-selected",
  "aria-pressed:text-selected-foreground",
  "aria-pressed:border-selected-foreground",
  "aria-checked:bg-selected",
  "aria-checked:text-selected-foreground",
  "aria-checked:border-selected-foreground",
] as const

function expectSelectedChrome(className: string) {
  const tokens = className.split(/\s+/)
  for (const token of selectedChrome) {
    expect(tokens).toContain(token)
  }
}

describe("Toggle", () => {
  it("styles the selected state from data-state, aria-pressed, and aria-checked", () => {
    expectSelectedChrome(selectedToggleChrome)
    expectSelectedChrome(toggleVariants())
    expect(toggleVariants()).toContain("hover:border-selected-foreground")
    expect(toggleVariants()).toContain("hover:bg-selected")
    expect(toggleVariants()).toContain("focus-visible:border-ring")
    expect(toggleVariants()).toContain("focus-visible:ring-ring")
    expect(toggleVariants()).not.toContain("hover:bg-muted")
  })

  it("toggles pressed state with pointer and keyboard", async () => {
    const user = createUser()
    render(<Toggle aria-label="Bold">B</Toggle>)

    const toggle = screen.getByRole("button", { name: "Bold" })
    expect(toggle).toHaveAttribute("aria-pressed", "false")
    expectSelectedChrome(toggle.className)
    expect(toggle.className.split(/\s+/)).toContain("hover:bg-selected")
    expect(toggle.className.split(/\s+/)).toContain(
      "hover:text-selected-foreground"
    )
    expect(toggle.className.split(/\s+/)).not.toContain("hover:bg-muted")

    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-pressed", "true")
    expect(toggle).toHaveAttribute("data-state", "on")

    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-pressed", "false")

    toggle.focus()
    await user.keyboard(" ")
    expect(toggle).toHaveAttribute("aria-pressed", "true")

    await user.keyboard("{Enter}")
    expect(toggle).toHaveAttribute("aria-pressed", "false")
  })
})

describe("ToggleGroup", () => {
  it("keeps a single selection", async () => {
    const user = createUser()
    render(
      <ToggleGroup type="single" defaultValue="day" aria-label="Range">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>
    )

    const day = screen.getByRole("radio", { name: "Day" })
    const week = screen.getByRole("radio", { name: "Week" })
    expect(day).toHaveAttribute("data-state", "on")
    expect(day).toHaveAttribute("aria-checked", "true")
    expect(day).not.toHaveAttribute("aria-pressed")
    expectSelectedChrome(day.className)
    expect(week).toHaveAttribute("data-state", "off")

    await user.click(week)
    expect(week).toHaveAttribute("data-state", "on")
    expect(week).toHaveAttribute("aria-checked", "true")
    expect(day).toHaveAttribute("data-state", "off")
  })

  it("allows multiple items to stay pressed", async () => {
    const user = createUser()
    render(
      <ToggleGroup type="multiple" aria-label="Style">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>
    )

    const bold = screen.getByRole("button", { name: "Bold" })
    const italic = screen.getByRole("button", { name: "Italic" })

    await user.click(bold)
    await user.click(italic)

    expect(bold).toHaveAttribute("data-state", "on")
    expect(italic).toHaveAttribute("data-state", "on")
    expect(bold).toHaveAttribute("aria-pressed", "true")
    expect(italic).toHaveAttribute("aria-pressed", "true")
    expectSelectedChrome(bold.className)
    expectSelectedChrome(italic.className)
  })

  it("moves focus between items with arrow keys", async () => {
    const user = createUser()
    render(
      <ToggleGroup type="single" defaultValue="day" aria-label="Range">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>
    )

    const day = screen.getByRole("radio", { name: "Day" })
    const week = screen.getByRole("radio", { name: "Week" })
    const month = screen.getByRole("radio", { name: "Month" })

    day.focus()
    await user.keyboard("{ArrowRight}")
    expect(week).toHaveFocus()

    await user.keyboard("{ArrowRight}")
    expect(month).toHaveFocus()

    await user.keyboard("{ArrowLeft}")
    expect(week).toHaveFocus()
  })
})
