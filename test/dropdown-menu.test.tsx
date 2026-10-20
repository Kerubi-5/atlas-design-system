import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../src/button.js"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../src/dropdown-menu.js"

import {
  createUser,
  render,
  screen,
  waitFor,
  waitForNoRole,
} from "./helpers.js"

describe("DropdownMenu", () => {
  function Menu({ onEdit }: { onEdit: () => void }) {
    const [archived, setArchived] = useState(false)
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Order 1042</DropdownMenuLabel>
          <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuCheckboxItem
            checked={archived}
            onCheckedChange={setArchived}
          >
            Show archived
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  it("opens from the keyboard, moves with arrows, and runs the item", async () => {
    const user = createUser()
    const onEdit = vi.fn()
    render(<Menu onEdit={onEdit} />)

    screen.getByRole("button", { name: "Actions" }).focus()
    await user.keyboard("{Enter}")
    const menu = await screen.findByRole("menu")
    expect(menu.className).toContain("rounded-none")
    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus()
    })

    await user.keyboard("{Enter}")
    expect(onEdit).toHaveBeenCalledTimes(1)
    await waitForNoRole("menu")
    expect(screen.getByRole("button", { name: "Actions" })).toHaveFocus()
  })

  it("toggles a checkbox item and marks destructive items", async () => {
    const user = createUser()
    render(<Menu onEdit={() => {}} />)

    await user.click(screen.getByRole("button", { name: "Actions" }))
    const archived = await screen.findByRole("menuitemcheckbox", {
      name: "Show archived",
    })
    expect(archived).toHaveAttribute("aria-checked", "false")
    await user.click(archived)

    await user.click(screen.getByRole("button", { name: "Actions" }))
    expect(
      await screen.findByRole("menuitemcheckbox", { name: "Show archived" })
    ).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute(
      "data-variant",
      "destructive"
    )
    // A missing `inset` must not render data-inset="false" (it would match).
    expect(
      screen.getByRole("menuitem", { name: "Delete" })
    ).not.toHaveAttribute("data-inset")
  })
})
