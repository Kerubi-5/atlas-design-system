import { useState } from "react"
import { describe, expect, it } from "vitest"

import { Combobox } from "../src/combobox.js"

import { createUser, render, screen, waitFor } from "./helpers.js"

const options = [
  { value: "usd", label: "US Dollar" },
  { value: "eur", label: "Euro" },
  { value: "gbp", label: "British Pound" },
  { value: "jpy", label: "Japanese Yen" },
]

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
