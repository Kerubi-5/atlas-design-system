import { fireEvent } from "@testing-library/react"
import { Profiler, useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { defaultSearchFilter, SearchPicker } from "../src/search-picker.js"

import { createUser, render, screen } from "./helpers.js"

const places = [
  { id: "1", name: "Niño" },
  { id: "2", name: "North" },
  { id: "3", name: "South" },
  { id: "4", name: "East" },
]
const getPlaceId = (item: (typeof places)[number]) => item.id
const getPlaceName = (item: (typeof places)[number]) => item.name

function PickerHarness({
  onSelect = vi.fn(),
  disabled,
  items = places,
  filter,
}: {
  onSelect?: (item: (typeof places)[number]) => void
  disabled?: boolean
  items?: (typeof places)[number][]
  filter?: (
    item: (typeof places)[number],
    query: string,
    getLabel: (item: (typeof places)[number]) => string
  ) => boolean
}) {
  const [value, setValue] = useState("2")
  return (
    <SearchPicker
      items={items}
      getValue={getPlaceId}
      getLabel={getPlaceName}
      filter={filter}
      value={value}
      onSelect={(item) => {
        setValue(item.id)
        onSelect(item)
      }}
      label="Place"
      placeholder="Search places"
      emptyText="No places"
      disabled={disabled}
    />
  )
}

function getCombobox() {
  return screen.getByRole("combobox", { name: "Place" })
}

function activeOptionLabel() {
  const id = getCombobox().getAttribute("aria-activedescendant")
  return id ? document.getElementById(id)?.textContent : undefined
}

describe("SearchPicker", () => {
  it("keeps a selectable highlight when the catalog shrinks or reloads", () => {
    const props = {
      items: places,
      getValue: getPlaceId,
      getLabel: getPlaceName,
      onSelect: vi.fn(),
      label: "Place",
    }
    const { rerender } = render(<SearchPicker {...props} />)
    const input = getCombobox()
    fireEvent.keyDown(input, { key: "End" })
    expect(activeOptionLabel()).toBe("East")

    rerender(<SearchPicker {...props} items={places.slice(0, 1)} />)
    expect(activeOptionLabel()).toBe("Niño")
    fireEvent.keyDown(input, { key: "Enter" })
    expect(props.onSelect).toHaveBeenLastCalledWith(places[0])

    rerender(<SearchPicker {...props} items={[]} />)
    expect(input).not.toHaveAttribute("aria-activedescendant")
    props.onSelect.mockClear()
    fireEvent.keyDown(input, { key: "Enter" })
    expect(props.onSelect).not.toHaveBeenCalled()

    rerender(<SearchPicker {...props} items={places.slice(0, 1)} />)
    expect(activeOptionLabel()).toBe("Niño")
    fireEvent.keyDown(input, { key: "Enter" })
    expect(props.onSelect).toHaveBeenCalledWith(places[0])
  })

  it("keeps the list visible and marks the selected option", () => {
    render(<PickerHarness />)

    expect(getCombobox()).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("listbox", { name: "Place" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "North" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it("filters with casefold and accent-fold includes", async () => {
    const user = createUser()
    const { rerender } = render(<PickerHarness />)

    await user.type(getCombobox(), "nino")
    expect(screen.getByRole("option", { name: "Niño" })).toBeInTheDocument()
    expect(
      screen.queryByRole("option", { name: "South" })
    ).not.toBeInTheDocument()

    rerender(
      <PickerHarness items={[...places, { id: "5", name: "Nino Nuevo" }]} />
    )
    expect(
      screen.getByRole("option", { name: "Nino Nuevo" })
    ).toBeInTheDocument()
    expect(defaultSearchFilter(places[0], " NINO ", getPlaceName)).toBe(true)
    expect(defaultSearchFilter(places[0], " ", getPlaceName)).toBe(true)

    rerender(
      <PickerHarness
        filter={(_item, query, getLabel) =>
          getLabel(_item).toLowerCase().includes(query.slice(0, 1))
        }
      />
    )
    expect(screen.getByRole("option", { name: "North" })).toBeInTheDocument()
    expect(
      screen.queryByRole("option", { name: "South" })
    ).not.toBeInTheDocument()
  })

  it("moves highlight with arrows, Home, End, and Page keys", async () => {
    const user = createUser()
    render(<PickerHarness />)

    getCombobox().focus()
    expect(activeOptionLabel()).toBe("North")

    await user.keyboard("{ArrowDown}")
    expect(activeOptionLabel()).toBe("South")
    await user.keyboard("{End}")
    expect(activeOptionLabel()).toBe("East")
    await user.keyboard("{Home}")
    expect(activeOptionLabel()).toBe("Niño")
    await user.keyboard("{PageDown}")
    expect(activeOptionLabel()).toBe("East")
    await user.keyboard("{PageUp}")
    expect(activeOptionLabel()).toBe("Niño")
  })

  it("selects with Enter and clears the query", async () => {
    const onSelect = vi.fn()
    const user = createUser()
    render(<PickerHarness onSelect={onSelect} />)

    await user.type(getCombobox(), "sou")
    await user.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledWith({ id: "3", name: "South" })
    expect(getCombobox()).toHaveValue("")
    expect(screen.getByRole("option", { name: "South" })).toHaveAttribute(
      "aria-selected",
      "true"
    )

    await user.type(getCombobox(), "east")
    await user.click(screen.getByRole("option", { name: "East" }))
    expect(onSelect).toHaveBeenLastCalledWith({ id: "4", name: "East" })
  })

  it("keeps options out of the Tab order", async () => {
    const user = createUser()
    render(
      <div>
        <PickerHarness />
        <button type="button">Next field</button>
      </div>
    )
    for (const option of screen.getAllByRole("option")) {
      expect(option).toHaveAttribute("tabindex", "-1")
    }
    await user.click(getCombobox())
    await user.tab()
    expect(screen.getByRole("button", { name: "Next field" })).toHaveFocus()
  })

  it("keeps keyboard navigation working after clicking a filtered option", async () => {
    const user = createUser()
    render(<PickerHarness />)
    await user.type(getCombobox(), "nor")
    await user.click(screen.getByRole("option", { name: "North" }))
    expect(getCombobox()).toHaveFocus()
    expect(getCombobox()).toHaveValue("")
    await user.keyboard("{ArrowDown}{Enter}")
    expect(screen.getByRole("option", { name: "South" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it.each([
    { shiftKey: true },
    { ctrlKey: true },
    { metaKey: true },
    { altKey: true },
  ])("leaves modified editing keys to the browser: %j", (modifier) => {
    render(<PickerHarness />)
    const before = activeOptionLabel()
    for (const key of ["Home", "End", "ArrowUp", "ArrowDown"]) {
      expect(fireEvent.keyDown(getCombobox(), { key, ...modifier })).toBe(true)
      expect(activeOptionLabel()).toBe(before)
    }
  })

  it("does not select on Enter while an IME is composing", () => {
    const onSelect = vi.fn()
    render(<PickerHarness onSelect={onSelect} />)

    fireEvent.keyDown(getCombobox(), {
      key: "Enter",
      keyCode: 229,
      isComposing: true,
    })
    fireEvent.keyDown(getCombobox(), { key: "Enter", isComposing: true })
    expect(onSelect).not.toHaveBeenCalled()

    fireEvent.keyDown(getCombobox(), { key: "Enter" })
    expect(onSelect).toHaveBeenCalledWith({ id: "2", name: "North" })
  })

  it("Escape clears the query, then blurs", async () => {
    const user = createUser()
    render(<PickerHarness />)

    await user.type(getCombobox(), "nor")
    expect(getCombobox()).toHaveValue("nor")
    await user.keyboard("{Escape}")
    expect(getCombobox()).toHaveValue("")
    expect(getCombobox()).toHaveFocus()
    await user.keyboard("{Escape}")
    expect(getCombobox()).not.toHaveFocus()
  })

  it("shows empty text and skips selection when disabled", async () => {
    const user = createUser()
    const { rerender } = render(<PickerHarness />)

    await user.type(getCombobox(), "zzz")
    expect(screen.getByText("No places")).toBeVisible()
    expect(screen.queryByRole("option")).not.toBeInTheDocument()
    // Announced from a status region outside the listbox, which may own
    // only options; the empty listbox keeps its name for aria-controls.
    expect(screen.getByRole("status")).toHaveTextContent("No places")
    expect(
      screen.getByRole("listbox", { name: "Place" }).children
    ).toHaveLength(0)

    rerender(<PickerHarness disabled />)
    expect(getCombobox()).toBeDisabled()
  })

  it("commits once per keystroke while resetting the highlight", async () => {
    const user = createUser()
    let commits = 0
    render(
      <Profiler id="picker" onRender={() => commits++}>
        <SearchPicker
          items={places}
          getValue={getPlaceId}
          getLabel={getPlaceName}
          value="3"
          onSelect={() => {}}
          label="Place"
        />
      </Profiler>
    )
    const input = screen.getByRole("combobox", { name: "Place" })
    commits = 0
    await user.type(input, "no")
    expect(commits).toBe(2)
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      screen.getAllByRole("option")[0]!.id
    )
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
})
