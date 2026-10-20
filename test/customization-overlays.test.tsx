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
    expect(classes(panel)).not.toContain(
      "w-[var(--radix-popover-trigger-width)]"
    )
    expect(panel.querySelector("[data-slot=combobox-search]")).not.toBeNull()
    for (const option of within(list).getAllByRole("option")) {
      expect(option).toHaveAttribute("data-slot", "combobox-option")
    }
  })

  it("keeps the panel at the trigger width by default", async () => {
    const user = createUser()
    render(
      <Combobox options={options} onValueChange={() => {}} aria-label="Word" />
    )
    await user.click(screen.getByRole("combobox", { name: "Word" }))
    const list = await screen.findByRole("listbox")
    expect(classes(list.closest("[data-slot=popover-content]")!)).toContain(
      "w-[var(--radix-popover-trigger-width)]"
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
        items={[{ id: "1", name: "Manila" }]}
        getValue={(item) => item.id}
        getLabel={(item) => item.name}
        onSelect={() => {}}
        label="Place"
        data-testid="place-picker"
        id="place"
      />
    )

    const root = screen.getByTestId("place-picker")
    expect(root).toHaveAttribute("data-slot", "search-picker")
    expect(root).toHaveAttribute("id", "place")
    expect(screen.getByRole("option", { name: "Manila" })).toHaveAttribute(
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
    render(
      <SearchPicker
        items={[{ id: "1", name: "Manila" }]}
        getValue={(item) => item.id}
        getLabel={(item) => item.name}
        onSelect={() => {}}
        label="Place"
      />
    )
    const option = screen.getByRole("option", { name: "Manila" })
    const names = classes(option)
    expect(names.filter((name) => name === "bg-accent")).toHaveLength(1)
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
  const keyEvent = (key: string, composing = false) => ({
    key,
    keyCode: composing ? 229 : 0,
    nativeEvent: { isComposing: composing } as KeyboardEvent,
    preventDefault: vi.fn(),
  })

  it("moves the highlight and selects on Enter", () => {
    const setHighlight = vi.fn()
    const onEnter = vi.fn()
    const down = keyEvent("ArrowDown")
    expect(
      handleListboxKey(down, { highlight: 0, length: 3, setHighlight, onEnter })
    ).toBe(true)
    expect(setHighlight).toHaveBeenCalledWith(1)
    expect(down.preventDefault).toHaveBeenCalled()

    const enter = keyEvent("Enter")
    expect(
      handleListboxKey(enter, {
        highlight: 2,
        length: 3,
        setHighlight,
        onEnter,
      })
    ).toBe(true)
    expect(onEnter).toHaveBeenCalledWith(2)
  })

  it("ignores keys while an IME composes and leaves other keys alone", () => {
    const setHighlight = vi.fn()
    const onEnter = vi.fn()
    const composing = keyEvent("Enter", true)
    expect(
      handleListboxKey(composing, {
        highlight: 0,
        length: 3,
        setHighlight,
        onEnter,
      })
    ).toBe(true)
    expect(onEnter).not.toHaveBeenCalled()
    expect(composing.preventDefault).not.toHaveBeenCalled()

    const escape = keyEvent("Escape")
    expect(
      handleListboxKey(escape, {
        highlight: 0,
        length: 3,
        setHighlight,
        onEnter,
      })
    ).toBe(false)
    expect(setHighlight).not.toHaveBeenCalled()
  })
})
