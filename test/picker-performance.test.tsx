import { fireEvent } from "@testing-library/react"
import { fr } from "date-fns/locale"
import { describe, expect, it, vi } from "vitest"

import { Calendar } from "../src/calendar.js"
import { Combobox } from "../src/combobox.js"
import { SearchPicker } from "../src/search-picker.js"

import { createUser, render, screen } from "./helpers.js"

describe("picker updates", () => {
  it("preserves calendar nodes on parent updates and refreshes locale without losing navigation focus", () => {
    const month = new Date(2026, 9, 1)
    const { container, rerender } = render(
      <Calendar mode="single" defaultMonth={month} />
    )
    const root = container.querySelector('[data-slot="calendar"]')
    const day = container.querySelector<HTMLButtonElement>("button[data-day]")!
    const nextMonth = screen.getByRole("button", {
      name: "Go to the Next Month",
    })
    nextMonth.focus()

    rerender(
      <Calendar mode="single" defaultMonth={month} className="updated" />
    )
    expect(container.querySelector('[data-slot="calendar"]')).toBe(root)
    expect(container.querySelector("button[data-day]")).toBe(day)
    expect(nextMonth).toHaveFocus()

    rerender(
      <Calendar
        mode="single"
        defaultMonth={month}
        locale={fr}
        weekStartsOn={0}
      />
    )
    expect(container.querySelector('[data-slot="calendar"]')).toBe(root)
    const localizedDay =
      container.querySelector<HTMLButtonElement>("button[data-day]")!
    expect(localizedDay.dataset.day).toBe(
      new Date(2026, 8, 27).toLocaleDateString("fr")
    )
    expect(localizedDay).toHaveAccessibleName(/septembre/)
    expect(nextMonth).toHaveFocus()
  })

  it("renders only the two changing SearchPicker rows on highlight moves", () => {
    const items = Array.from({ length: 400 }, (_, index) => ({
      id: String(index),
      name: `Option ${index}`,
    }))
    const getLabel = vi.fn((item: (typeof items)[number]) => item.name)
    const getValue = vi.fn((item: (typeof items)[number]) => item.id)
    const onSelect = vi.fn()
    const props = { items, getLabel, getValue, onSelect, label: "Choice" }
    const { rerender } = render(<SearchPicker {...props} />)
    const input = screen.getByRole("combobox", { name: "Choice" })
    const rows = screen.getAllByRole("option")
    getLabel.mockClear()
    getValue.mockClear()

    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(getLabel).toHaveBeenCalledTimes(2)
    expect(getValue).not.toHaveBeenCalled()
    expect(input).toHaveAttribute("aria-activedescendant", rows[1]!.id)

    getLabel.mockClear()
    fireEvent.mouseEnter(rows[3]!)
    expect(getLabel).toHaveBeenCalledTimes(2)

    const nextOnSelect = vi.fn()
    rerender(
      <SearchPicker
        {...props}
        onSelect={nextOnSelect}
        getLabel={(item) => `Updated ${item.name}`}
      />
    )
    expect(rows[3]).toHaveAccessibleName("Updated Option 3")
    fireEvent.click(rows[3]!)
    expect(nextOnSelect).toHaveBeenCalledWith(items[3])
    expect(onSelect).not.toHaveBeenCalled()

    rerender(<SearchPicker {...props} disabled />)
    expect(rows[3]).toBeDisabled()
  })

  it("keeps custom filtering and invalidates the search index when a catalog changes", () => {
    const items = [
      { id: "1", name: "Niño" },
      { id: "2", name: "North" },
    ]
    const getLabel = (item: (typeof items)[number]) => item.name
    const props = {
      items,
      getLabel,
      getValue: (item: (typeof items)[number]) => item.id,
      onSelect: vi.fn(),
      label: "Choice",
    }
    const { rerender } = render(<SearchPicker {...props} />)
    const input = screen.getByRole("combobox", { name: "Choice" })
    fireEvent.change(input, { target: { value: " NINO " } })
    expect(screen.getAllByRole("option")).toHaveLength(1)
    rerender(
      <SearchPicker
        {...props}
        items={[...items, { id: "3", name: "Nino Nuevo" }]}
      />
    )
    expect(screen.getAllByRole("option")).toHaveLength(2)

    const filter = vi.fn(
      (_item: (typeof items)[number], query: string) => query === " NINO "
    )
    rerender(<SearchPicker {...props} filter={filter} />)
    expect(filter).toHaveBeenCalledWith(items[0], " NINO ", getLabel)
    expect(screen.getAllByRole("option")).toHaveLength(2)
    filter.mockClear()
    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(filter).not.toHaveBeenCalled()
  })

  it("caches Combobox creation checks on navigation and refreshes them for new props", async () => {
    const options = [
      { value: "1", label: "Niño" },
      { value: "2", label: "Nino Nuevo" },
    ]
    const normalizeCreateValue = vi.fn((query: string) => query.trim())
    const createLabel = vi.fn((value: string) => `Add ${value}`)
    const props = {
      options,
      creatable: true,
      normalizeCreateValue,
      createLabel,
      onValueChange: vi.fn(),
      "aria-label": "Choice",
    }
    const { rerender } = render(<Combobox {...props} />)
    await createUser().click(screen.getByRole("combobox", { name: "Choice" }))
    const input = screen.getByRole("textbox", { name: "Search" })
    fireEvent.change(input, { target: { value: "nino" } })
    expect(screen.getAllByRole("option")).toHaveLength(2)
    expect(
      screen.queryByRole("option", { name: "Add nino" })
    ).not.toBeInTheDocument()

    fireEvent.change(input, { target: { value: "ni" } })
    expect(screen.getByRole("option", { name: "Add ni" })).toBeInTheDocument()
    normalizeCreateValue.mockClear()
    createLabel.mockClear()
    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.mouseEnter(screen.getByRole("option", { name: "Add ni" }))
    expect(normalizeCreateValue).not.toHaveBeenCalled()
    expect(createLabel).not.toHaveBeenCalled()

    rerender(
      <Combobox
        {...props}
        options={[...options, { value: "ni", label: "New catalog entry" }]}
      />
    )
    expect(
      screen.queryByRole("option", { name: "Add ni" })
    ).not.toBeInTheDocument()
    expect(normalizeCreateValue).toHaveBeenCalledTimes(1)

    const nextOnValueChange = vi.fn()
    rerender(
      <Combobox
        {...props}
        onValueChange={nextOnValueChange}
        normalizeCreateValue={() => "New"}
        createLabel={(value) => `Create ${value}`}
      />
    )
    fireEvent.click(screen.getByRole("option", { name: "Create New" }))
    expect(nextOnValueChange).toHaveBeenCalledWith("New")
    expect(props.onValueChange).not.toHaveBeenCalled()
  })
})
