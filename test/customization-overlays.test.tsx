import { fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Combobox } from "../src/combobox.js"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "../src/dialog.js"
import { InfoTip } from "../src/info-tip.js"
import { handleListboxKey } from "../src/internal/listbox-navigation.js"
import { SearchPicker } from "../src/search-picker.js"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/select.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "../src/tooltip.js"
import { placeItems } from "../stories/search-picker.js"

import { classes, createUser, render, screen, within } from "./helpers.js"

/**
 * Overlays and pickers stay customizable: every visible part has a
 * `data-slot`, and parts `className` cannot reach take their own prop.
 */

describe("Dialog customization", () => {
  it("styles the overlay and the built-in close button by prop", () => {
    render(
      <Dialog open>
        <DialogContent
          aria-describedby={undefined}
          overlayClassName="bg-black/60"
          closeButtonClassName="top-2 right-2"
        >
          <DialogTitle>Title</DialogTitle>
          <DialogClose>Cancel</DialogClose>
        </DialogContent>
      </Dialog>
    )

    const overlay = document.querySelector("[data-slot=dialog-overlay]")!
    expect(overlay).toHaveClass("bg-black/60")
    expect(overlay).not.toHaveClass("bg-black/20")

    const close = screen.getByRole("button", { name: "Close" })
    expect(close).toHaveAttribute("data-slot", "dialog-close-button")
    expect(close).toHaveClass("top-2")
    expect(close).not.toHaveClass("top-4")

    // A consumer's own DialogClose keeps the public slot.
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute(
      "data-slot",
      "dialog-close"
    )
  })
})

describe("Select customization", () => {
  it("names the viewport, item indicator, and icon", async () => {
    const user = createUser()
    render(
      <Select defaultValue="ny">
        <SelectTrigger aria-label="City">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ny">New York</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole("combobox", { name: "City" })
    expect(trigger.querySelector("[data-slot=select-icon]")).not.toBeNull()

    await user.click(trigger)
    const listbox = await screen.findByRole("listbox")
    expect(
      listbox
        .closest("[data-slot=select-content]")!
        .querySelector("[data-slot=select-viewport]")
    ).not.toBeNull()
    const option = within(listbox).getByRole("option", { name: "New York" })
    expect(
      option.querySelector("[data-slot=select-item-indicator]")
    ).not.toBeNull()
  })

  it("lets a className height replace the trigger size", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Compact" className="h-8">
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    render(
      <Select>
        <SelectTrigger aria-label="Small" size="sm">
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    render(
      <Select>
        <SelectTrigger aria-label="Default">
          <SelectValue />
        </SelectTrigger>
      </Select>
    )

    const compact = classes(screen.getByRole("combobox", { name: "Compact" }))
    expect(compact).toContain("h-8")
    expect(compact.filter((name) => /(?:^|:)h-(?:9|10)$/.test(name))).toEqual(
      []
    )
    expect(classes(screen.getByRole("combobox", { name: "Small" }))).toContain(
      "h-9"
    )
    expect(
      classes(screen.getByRole("combobox", { name: "Default" }))
    ).toContain("h-10")
  })
})

describe("Tooltip customization", () => {
  it("names the arrow and styles it by prop", async () => {
    render(
      <Tooltip open>
        <TooltipTrigger>Save</TooltipTrigger>
        <TooltipContent arrowClassName="fill-primary">
          Save draft
        </TooltipContent>
      </Tooltip>
    )

    await screen.findAllByText("Save draft")
    const arrow = document.querySelector("[data-slot=tooltip-arrow]")!
    expect(arrow).not.toBeNull()
    expect(arrow.getAttribute("class")!.split(/\s+/)).toContain("fill-primary")
    expect(arrow.getAttribute("class")!.split(/\s+/)).not.toContain(
      "fill-foreground"
    )
  })
})

describe("Combobox customization", () => {
  const options = [
    { value: "es", label: "Niño" },
    { value: "en", label: "Child" },
  ]

  it("sizes the panel, names its parts, and forwards trigger props", async () => {
    const user = createUser()
    const onFocus = vi.fn()
    render(
      <Combobox
        options={options}
        onValueChange={() => {}}
        aria-label="Word"
        contentClassName="w-96"
        data-testid="word-trigger"
        name="word"
        onFocus={onFocus}
      />
    )

    const trigger = screen.getByTestId("word-trigger")
    expect(trigger).toHaveAttribute("name", "word")
    trigger.focus()
    expect(onFocus).toHaveBeenCalled()

    await user.click(trigger)
    const list = await screen.findByRole("listbox")
    expect(list).toHaveAttribute("data-slot", "combobox-list")
    const panel = list.closest("[data-slot=popover-content]")!
    expect(panel).toHaveClass("w-96")
    expect(classes(panel)).not.toContain("w-max")
    expect(panel.querySelector("[data-slot=combobox-search]")).not.toBeNull()
    for (const option of within(list).getAllByRole("option")) {
      expect(option).toHaveAttribute("data-slot", "combobox-option")
    }
  })

  it("keeps the panel at least as wide as the trigger by default", async () => {
    const user = createUser()
    render(
      <Combobox options={options} onValueChange={() => {}} aria-label="Word" />
    )
    await user.click(screen.getByRole("combobox", { name: "Word" }))
    const list = await screen.findByRole("listbox")
    expect(classes(list.closest("[data-slot=popover-content]")!)).toEqual(
      expect.arrayContaining(["w-max", "min-w-(--radix-popover-trigger-width)"])
    )
  })

  it("matches accents loosely: nino finds Niño", async () => {
    const user = createUser()
    render(
      <Combobox
        options={options}
        onValueChange={() => {}}
        aria-label="Word"
        creatable
      />
    )
    await user.click(screen.getByRole("combobox", { name: "Word" }))
    await user.type(await screen.findByRole("textbox"), "nino")
    const list = screen.getByRole("listbox")
    expect(within(list).getByRole("option", { name: "Niño" })).toBeVisible()
    // Already an option once accents fold, so no create action.
    expect(
      within(list).queryByRole("option", { name: /create/i })
    ).not.toBeInTheDocument()
  })
})

describe("SearchPicker customization", () => {
  it("names options and the empty state, and forwards root props", () => {
    render(
      <SearchPicker
        {...placeItems}
        onSelect={() => {}}
        label="Place"
        data-testid="place-picker"
        id="place"
      />
    )

    const root = screen.getByTestId("place-picker")
    expect(root).toHaveAttribute("data-slot", "search-picker")
    expect(root).toHaveAttribute("id", "place")
    expect(screen.getByRole("option", { name: "North ward" })).toHaveAttribute(
      "data-slot",
      "search-picker-option"
    )

    fireEvent.change(screen.getByRole("combobox", { name: "Place" }), {
      target: { value: "zzz" },
    })
    expect(screen.getByRole("status")).toHaveAttribute(
      "data-slot",
      "search-picker-empty"
    )
  })

  it("does not repeat the active fill on top of the shared highlight", () => {
    render(<SearchPicker {...placeItems} onSelect={() => {}} label="Place" />)
    const option = screen.getByRole("option", { name: "North ward" })
    const names = classes(option)
    expect(names.filter((name) => name === "bg-selected")).toHaveLength(1)
  })
})

describe("InfoTip customization", () => {
  it("forwards extra props to the trigger", () => {
    render(<InfoTip label="About depth" data-testid="depth-tip" tabIndex={3} />)
    const trigger = screen.getByTestId("depth-tip")
    expect(trigger).toHaveAccessibleName("About depth")
    expect(trigger).toHaveAttribute("tabindex", "3")
  })
})

describe("handleListboxKey", () => {
  /** Press `key` in a three-item list highlighted at `highlight`. */
  function pressKey(key: string, { highlight = 0, composing = false } = {}) {
    const event = {
      key,
      keyCode: composing ? 229 : 0,
      nativeEvent: { isComposing: composing } as KeyboardEvent,
      preventDefault: vi.fn(),
    }
    const setHighlight = vi.fn()
    const onPick = vi.fn()
    const handled = handleListboxKey(event, {
      items: ["a", "b", "c"],
      highlight,
      setHighlight,
      onPick,
    })
    return { handled, event, setHighlight, onPick }
  }

  it("moves the highlight and selects on Enter", () => {
    const down = pressKey("ArrowDown")
    expect(down.handled).toBe(true)
    expect(down.setHighlight).toHaveBeenCalledWith(1)
    expect(down.event.preventDefault).toHaveBeenCalled()

    const enter = pressKey("Enter", { highlight: 2 })
    expect(enter.handled).toBe(true)
    expect(enter.onPick).toHaveBeenCalledWith("c")
  })

  it("ignores keys while an IME composes and leaves other keys alone", () => {
    const composing = pressKey("Enter", { composing: true })
    expect(composing.handled).toBe(true)
    expect(composing.onPick).not.toHaveBeenCalled()
    expect(composing.event.preventDefault).not.toHaveBeenCalled()

    const escape = pressKey("Escape")
    expect(escape.handled).toBe(false)
    expect(escape.setHighlight).not.toHaveBeenCalled()
  })
})
