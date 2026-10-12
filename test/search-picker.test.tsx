import { useState } from "react"
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
    expect(screen.getByText("No places")).toBeInTheDocument()
    expect(screen.queryByRole("option")).not.toBeInTheDocument()

    rerender(<PickerHarness disabled />)
    expect(getCombobox()).toBeDisabled()
  })
})
