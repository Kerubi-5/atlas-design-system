import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Combobox } from "../src/combobox.js"

import { createUser, render, screen, waitFor } from "./helpers.js"

const options = [
  { value: "usd", label: "US Dollar" },
  { value: "eur", label: "Euro" },
  { value: "gbp", label: "British Pound" },
  { value: "jpy", label: "Japanese Yen" },
]

/** Long enough to overflow `max-h-60` the way a timezone list does. */
function timezoneOptions(count = 48) {
  return Array.from({ length: count }, (_, index) => ({
    value: `tz-${index}`,
    label: `Timezone ${String(index).padStart(2, "0")}`,
  }))
}

function ComboboxHarness({
  initialValue,
  emptyText,
}: {
  initialValue?: string
  emptyText?: string
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={setValue}
      emptyText={emptyText}
    />
  )
}

/**
 * `role="combobox"` does not take its name from contents, so queries use the
 * role plus visible text rather than an accessible name.
 */
function getCombobox() {
  return screen.getByRole("combobox")
}

async function openCombobox(user: ReturnType<typeof createUser>) {
  await user.click(getCombobox())
  return waitFor(() => {
    expect(screen.getByRole("listbox")).toBeInTheDocument()
  })
}

describe("Combobox", () => {
  it("opens and closes from the trigger", async () => {
    const user = createUser()
    render(<ComboboxHarness />)

    const trigger = getCombobox()
    expect(trigger).toHaveTextContent("Select")
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    await openCombobox(user)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("option", { name: "US Dollar" })).toBeVisible()

    await user.click(trigger)
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("filters options from the search field and shows the empty state", async () => {
    const user = createUser()
    render(<ComboboxHarness emptyText="No currencies" />)
    await openCombobox(user)

    const search = screen.getByPlaceholderText("Search")
    await user.type(search, "yen")

    expect(screen.getByRole("option", { name: "Japanese Yen" })).toBeVisible()
    expect(
      screen.queryByRole("option", { name: "Euro" })
    ).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, "zzzz")
    expect(screen.queryByRole("option")).not.toBeInTheDocument()
    expect(screen.getByText("No currencies")).toBeVisible()
  })

  it("moves the highlight with arrows, Home, and End, then selects with Enter", async () => {
    const user = createUser()
    render(<ComboboxHarness />)
    await openCombobox(user)

    const search = screen.getByPlaceholderText("Search")
    expect(search.getAttribute("aria-activedescendant")).toContain("option-usd")

    await user.keyboard("{ArrowDown}")
    expect(search.getAttribute("aria-activedescendant")).toContain("option-eur")

    await user.keyboard("{End}")
    expect(search.getAttribute("aria-activedescendant")).toContain("option-jpy")

    await user.keyboard("{Home}")
    expect(search.getAttribute("aria-activedescendant")).toContain("option-usd")

    await user.keyboard("{ArrowUp}")
    expect(search.getAttribute("aria-activedescendant")).toContain("option-usd")

    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(search.getAttribute("aria-activedescendant")).toContain("option-gbp")

    await user.keyboard("{Enter}")
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(getCombobox()).toHaveTextContent("British Pound")
  })

  it("pages the highlight with PageDown and PageUp", async () => {
    const user = createUser()
    render(<Combobox options={timezoneOptions()} onValueChange={() => {}} />)
    await openCombobox(user)

    const search = screen.getByPlaceholderText("Search")
    const option = (index: number) =>
      screen.getByRole("option", {
        name: `Timezone ${String(index).padStart(2, "0")}`,
      })

    expect(search.getAttribute("aria-activedescendant")).toBe(option(0).id)

    await user.keyboard("{PageDown}")
    expect(search.getAttribute("aria-activedescendant")).toBe(option(10).id)

    await user.keyboard("{PageDown}")
    expect(search.getAttribute("aria-activedescendant")).toBe(option(20).id)

    await user.keyboard("{PageUp}")
    expect(search.getAttribute("aria-activedescendant")).toBe(option(10).id)

    await user.keyboard("{End}")
    expect(search.getAttribute("aria-activedescendant")).toBe(option(47).id)

    await user.keyboard("{PageDown}")
    expect(search.getAttribute("aria-activedescendant")).toBe(option(47).id)
  })

  it("scrolls the highlighted option into view for Home, End, Page, and arrows", async () => {
    const user = createUser()
    render(<Combobox options={timezoneOptions()} onValueChange={() => {}} />)
    await openCombobox(user)

    const search = screen.getByPlaceholderText("Search")
    const last = screen.getByRole("option", { name: "Timezone 47" })
    const lastSpy = vi.spyOn(last, "scrollIntoView")

    await user.keyboard("{End}")
    expect(search.getAttribute("aria-activedescendant")).toBe(last.id)
    await waitFor(() => {
      expect(lastSpy).toHaveBeenCalledWith({ block: "nearest" })
    })

    const first = screen.getByRole("option", { name: "Timezone 00" })
    const firstSpy = vi.spyOn(first, "scrollIntoView")
    await user.keyboard("{Home}")
    expect(search.getAttribute("aria-activedescendant")).toBe(first.id)
    await waitFor(() => {
      expect(firstSpy).toHaveBeenCalledWith({ block: "nearest" })
    })

    const paged = screen.getByRole("option", { name: "Timezone 10" })
    const pageSpy = vi.spyOn(paged, "scrollIntoView")
    await user.keyboard("{PageDown}")
    expect(search.getAttribute("aria-activedescendant")).toBe(paged.id)
    await waitFor(() => {
      expect(pageSpy).toHaveBeenCalledWith({ block: "nearest" })
    })

    await user.keyboard("{PageUp}")
    expect(search.getAttribute("aria-activedescendant")).toBe(first.id)

    const next = screen.getByRole("option", { name: "Timezone 01" })
    const nextSpy = vi.spyOn(next, "scrollIntoView")
    await user.keyboard("{ArrowDown}")
    expect(search.getAttribute("aria-activedescendant")).toBe(next.id)
    await waitFor(() => {
      expect(nextSpy).toHaveBeenCalledWith({ block: "nearest" })
    })

    const prevSpy = vi.spyOn(first, "scrollIntoView")
    await user.keyboard("{ArrowUp}")
    expect(search.getAttribute("aria-activedescendant")).toBe(first.id)
    await waitFor(() => {
      expect(prevSpy).toHaveBeenCalledWith({ block: "nearest" })
    })
  })

  it("scrolls the selected option into view when a long list opens", async () => {
    const user = createUser()
    const protoSpy = vi.spyOn(Element.prototype, "scrollIntoView")
    try {
      render(
        <Combobox
          options={timezoneOptions()}
          value="tz-47"
          onValueChange={() => {}}
        />
      )
      await openCombobox(user)

      const selected = screen.getByRole("option", { name: "Timezone 47" })
      expect(
        screen
          .getByPlaceholderText("Search")
          .getAttribute("aria-activedescendant")
      ).toBe(selected.id)
      await waitFor(() => {
        expect(protoSpy.mock.instances.some((node) => node === selected)).toBe(
          true
        )
      })
      expect(protoSpy).toHaveBeenCalledWith({ block: "nearest" })
    } finally {
      protoSpy.mockRestore()
    }
  })

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = createUser()
    render(<ComboboxHarness initialValue="eur" />)
    await openCombobox(user)

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(getCombobox()).toHaveFocus()
    expect(getCombobox()).toHaveTextContent("Euro")
    expect(getCombobox()).toHaveAttribute("aria-expanded", "false")
  })

  it("selects an option with the pointer", async () => {
    const user = createUser()
    render(<ComboboxHarness />)
    await openCombobox(user)

    await user.click(screen.getByRole("option", { name: "Euro" }))
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(getCombobox()).toHaveTextContent("Euro")
  })

  it("does not open when disabled", async () => {
    const user = createUser()
    render(<Combobox options={options} onValueChange={() => {}} disabled />)

    await user.click(screen.getByRole("combobox"))
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeDisabled()
  })
})
