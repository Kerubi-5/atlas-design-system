import { fireEvent } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Combobox } from "../src/combobox.js"

import {
  createUser,
  expectFormControlTrigger,
  render,
  screen,
  waitFor,
} from "./helpers.js"

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
  creatable,
  normalizeCreateValue,
  createLabel,
  onValueChange,
}: {
  initialValue?: string
  emptyText?: string
  creatable?: boolean
  normalizeCreateValue?: (query: string) => string | null
  createLabel?: (value: string) => string
  onValueChange?: (value: string) => void
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={(next) => {
        onValueChange?.(next)
        setValue(next)
      }}
      emptyText={emptyText}
      creatable={creatable}
      normalizeCreateValue={normalizeCreateValue}
      createLabel={createLabel}
    />
  )
}

/** App-side ISO 4217-style check: three letters, normalized to uppercase. */
function iso4217Code(query: string) {
  const code = query.trim().toUpperCase()
  return /^[A-Z]{3}$/.test(code) ? code : null
}

/**
 * `role="combobox"` does not take its name from contents, so queries use the
 * role plus visible text rather than an accessible name.
 */
function getCombobox() {
  return screen.getByRole("combobox")
}

/** Label of the option the search field's aria-activedescendant points at. */
function activeOptionLabel() {
  const id = screen
    .getByPlaceholderText("Search")
    .getAttribute("aria-activedescendant")
  return id ? document.getElementById(id)?.textContent : undefined
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
    expectFormControlTrigger(trigger)
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
    // Announced from a status region outside the listbox, which may own
    // only options (role=none wrappers are transparent).
    expect(screen.getByRole("status")).toHaveTextContent("No currencies")
    for (const child of Array.from(screen.getByRole("listbox").children)) {
      expect(child).toHaveAttribute("role", "none")
    }
  })

  it("names the listbox and the search field", async () => {
    const user = createUser()
    render(
      <Combobox
        aria-label="Currency"
        options={options}
        onValueChange={vi.fn()}
      />
    )
    await user.click(screen.getByRole("combobox", { name: "Currency" }))
    expect(await screen.findByRole("listbox")).toHaveAccessibleName("Currency")
    expect(screen.getByRole("textbox", { name: "Search" })).toBeVisible()
  })

  it("names the listbox from the <label> for the trigger", async () => {
    const user = createUser()
    render(
      <div>
        <label htmlFor="currency">Currency</label>
        <Combobox id="currency" options={options} onValueChange={vi.fn()} />
      </div>
    )
    await openCombobox(user)
    expect(screen.getByRole("listbox")).toHaveAccessibleName("Currency")
  })

  it.each(["{ArrowDown}", "{ArrowUp}", "{Alt>}{ArrowDown}{/Alt}"])(
    "opens from the focused trigger with %s",
    async (keys) => {
      const user = createUser()
      render(<ComboboxHarness />)
      await user.tab()
      expect(getCombobox()).toHaveFocus()

      await user.keyboard(keys)
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument()
      })
      expect(getCombobox()).toHaveAttribute("aria-expanded", "true")
    }
  )

  it("keeps options out of the Tab order and marks the highlighted one", async () => {
    const user = createUser()
    render(<ComboboxHarness />)
    await openCombobox(user)
    const search = screen.getByPlaceholderText("Search")
    await waitFor(() => expect(search).toHaveFocus())

    for (const option of screen.getAllByRole("option")) {
      expect(option).toHaveAttribute("tabindex", "-1")
    }
    const highlighted = screen.getByRole("option", { name: "US Dollar" })
    expect(highlighted.className).toMatch(/bg-accent/)
    expect(highlighted.className).toMatch(/shadow-\[inset_2px/)

    await user.tab()
    expect(document.activeElement).not.toHaveAttribute("role", "option")
  })

  it("does not select on Enter while an IME is composing", async () => {
    const user = createUser()
    const onValueChange = vi.fn()
    render(<ComboboxHarness onValueChange={onValueChange} />)
    await openCombobox(user)

    const search = screen.getByPlaceholderText("Search")
    fireEvent.keyDown(search, { key: "Enter", keyCode: 229, isComposing: true })
    fireEvent.keyDown(search, { key: "Enter", isComposing: true })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole("listbox")).toBeInTheDocument()

    fireEvent.keyDown(search, { key: "Enter" })
    expect(onValueChange).toHaveBeenCalledWith("usd")
  })

  it("moves the highlight with arrows, Home, and End, then selects with Enter", async () => {
    const user = createUser()
    render(<ComboboxHarness />)
    await openCombobox(user)

    expect(activeOptionLabel()).toBe("US Dollar")

    await user.keyboard("{ArrowDown}")
    expect(activeOptionLabel()).toBe("Euro")

    await user.keyboard("{End}")
    expect(activeOptionLabel()).toBe("Japanese Yen")

    await user.keyboard("{Home}")
    expect(activeOptionLabel()).toBe("US Dollar")

    await user.keyboard("{ArrowUp}")
    expect(activeOptionLabel()).toBe("US Dollar")

    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(activeOptionLabel()).toBe("British Pound")

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
    const scrolled: Element[] = []
    const originalElement = Element.prototype.scrollIntoView
    const originalHtml = HTMLElement.prototype.scrollIntoView
    const record = function (
      this: Element,
      _options?: boolean | ScrollIntoViewOptions
    ) {
      scrolled.push(this)
    }
    Element.prototype.scrollIntoView = record
    HTMLElement.prototype.scrollIntoView = record

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
        expect(scrolled).toContain(selected)
      })
    } finally {
      Element.prototype.scrollIntoView = originalElement
      HTMLElement.prototype.scrollIntoView = originalHtml
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

  it("clears the search after a selection so reopening does not pick the wrong option", async () => {
    const user = createUser()
    render(<ComboboxHarness />)
    await openCombobox(user)

    // "e" leaves Euro and Japanese Yen; pick Euro with the pointer.
    await user.type(screen.getByPlaceholderText("Search"), "e")
    await user.click(screen.getByRole("option", { name: "Euro" }))
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })

    await openCombobox(user)
    expect(screen.getByPlaceholderText("Search")).toHaveValue("")
    expect(screen.getAllByRole("option")).toHaveLength(options.length)
    expect(activeOptionLabel()).toBe("Euro")

    await user.keyboard("{Enter}")
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(getCombobox()).toHaveTextContent("Euro")
  })

  it("clears the search after selecting with Enter", async () => {
    const user = createUser()
    render(<ComboboxHarness />)
    await openCombobox(user)

    await user.type(screen.getByPlaceholderText("Search"), "yen")
    await user.keyboard("{Enter}")
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(getCombobox()).toHaveTextContent("Japanese Yen")

    await openCombobox(user)
    expect(screen.getByPlaceholderText("Search")).toHaveValue("")
    expect(activeOptionLabel()).toBe("Japanese Yen")
  })

  it("uses valid option ids when values contain spaces", async () => {
    const user = createUser()
    render(
      <Combobox
        options={[
          { value: "America/New York", label: "New York" },
          { value: "Europe/London", label: "London" },
        ]}
        onValueChange={() => {}}
      />
    )
    await openCombobox(user)

    for (const option of screen.getAllByRole("option")) {
      expect(option.id).not.toMatch(/\s/)
    }
    expect(activeOptionLabel()).toBe("New York")
  })

  it("does not open when disabled", async () => {
    const user = createUser()
    render(<Combobox options={options} onValueChange={() => {}} disabled />)

    await user.click(screen.getByRole("combobox"))
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it("does not offer a create action when creatable is off", async () => {
    const onValueChange = vi.fn()
    const user = createUser()
    render(
      <ComboboxHarness
        emptyText="No currencies"
        onValueChange={onValueChange}
      />
    )
    await openCombobox(user)

    await user.type(screen.getByPlaceholderText("Search"), "php")
    expect(screen.queryByRole("option")).not.toBeInTheDocument()
    expect(screen.getByText("No currencies")).toBeVisible()
    expect(
      screen.queryByRole("option", { name: /create/i })
    ).not.toBeInTheDocument()

    await user.keyboard("{Enter}")
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole("listbox")).toBeVisible()
    expect(getCombobox()).toHaveTextContent("Select")
  })

  it("creates an unmatched query with pointer and Enter", async () => {
    const onValueChange = vi.fn()
    const user = createUser()
    render(<ComboboxHarness creatable onValueChange={onValueChange} />)
    await openCombobox(user)

    await user.type(screen.getByPlaceholderText("Search"), "PHP")
    const createOption = screen.getByRole("option", { name: 'Create "PHP"' })
    expect(createOption).toBeVisible()
    expect(screen.queryByText("No results")).not.toBeInTheDocument()
    expect(activeOptionLabel()).toBe('Create "PHP"')

    await user.click(createOption)
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(onValueChange).toHaveBeenCalledWith("PHP")
    expect(getCombobox()).toHaveTextContent("PHP")

    await openCombobox(user)
    await user.clear(screen.getByPlaceholderText("Search"))
    await user.type(screen.getByPlaceholderText("Search"), "kyd")
    expect(activeOptionLabel()).toBe('Create "kyd"')
    await user.keyboard("{Enter}")
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(onValueChange).toHaveBeenCalledWith("kyd")
    expect(getCombobox()).toHaveTextContent("kyd")
  })

  it("does not create on empty query, Escape, or a rejected normalize", async () => {
    const onValueChange = vi.fn()
    const user = createUser()
    const { unmount } = render(
      <ComboboxHarness
        creatable
        emptyText="No currencies"
        normalizeCreateValue={iso4217Code}
        onValueChange={onValueChange}
      />
    )
    await openCombobox(user)

    expect(
      screen.queryByRole("option", { name: /create/i })
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole("option")).toHaveLength(options.length)

    await user.type(screen.getByPlaceholderText("Search"), "xx")
    expect(screen.queryByRole("option")).not.toBeInTheDocument()
    expect(screen.getByText("No currencies")).toBeVisible()
    await user.keyboard("{Enter}")
    expect(onValueChange).not.toHaveBeenCalled()

    await user.clear(screen.getByPlaceholderText("Search"))
    await user.type(screen.getByPlaceholderText("Search"), "php")
    expect(screen.getByRole("option", { name: 'Create "PHP"' })).toBeVisible()

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(getCombobox()).toHaveTextContent("Select")
    unmount()

    render(
      <ComboboxHarness
        creatable
        emptyText="No currencies"
        normalizeCreateValue={() => "   "}
        onValueChange={onValueChange}
      />
    )
    await openCombobox(user)
    await user.type(screen.getByPlaceholderText("Search"), "php")
    expect(
      screen.queryByRole("option", { name: /create/i })
    ).not.toBeInTheDocument()
    expect(screen.getByText("No currencies")).toBeVisible()
  })

  it("does not offer create when the query already matches an option", async () => {
    const user = createUser()
    const { unmount } = render(
      <ComboboxHarness creatable normalizeCreateValue={iso4217Code} />
    )
    await openCombobox(user)

    await user.type(screen.getByPlaceholderText("Search"), "usd")
    expect(
      screen.queryByRole("option", { name: /create/i })
    ).not.toBeInTheDocument()
    expect(screen.getByText("No results")).toBeVisible()
    unmount()

    render(<ComboboxHarness creatable />)
    await openCombobox(user)
    await user.type(screen.getByPlaceholderText("Search"), "Euro")
    expect(screen.getByRole("option", { name: "Euro" })).toBeVisible()
    expect(
      screen.queryByRole("option", { name: /create/i })
    ).not.toBeInTheDocument()

    await user.keyboard("{Enter}")
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(getCombobox()).toHaveTextContent("Euro")
  })

  it("keeps matching options and appends a create action", async () => {
    const user = createUser()
    render(
      <ComboboxHarness creatable createLabel={(value) => `Add ${value}`} />
    )
    await openCombobox(user)

    await user.type(screen.getByPlaceholderText("Search"), "e")
    expect(screen.getByRole("option", { name: "Euro" })).toBeVisible()
    expect(screen.getByRole("option", { name: "Add e" })).toBeVisible()
    expect(activeOptionLabel()).toBe("Euro")

    await user.keyboard("{End}")
    expect(activeOptionLabel()).toBe("Add e")
    await user.keyboard("{Enter}")
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
    expect(getCombobox()).toHaveTextContent("e")
  })
})
