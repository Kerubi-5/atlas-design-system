import { describe, expect, it } from "vitest"

import { Button } from "../src/button.js"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../src/dialog.js"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "../src/popover.js"

import { createUser, render, screen, waitFor } from "./helpers.js"

function focusIsInside(container: Element | null) {
  return Boolean(
    container &&
    document.activeElement &&
    container.contains(document.activeElement)
  )
}

describe("Popover", () => {
  it("opens, moves focus in, and returns it to the trigger on close", async () => {
    const user = createUser()
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">Open filters</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Filters</PopoverTitle>
          <PopoverDescription>Limit the table.</PopoverDescription>
          <button type="button">Apply</button>
        </PopoverContent>
      </Popover>
    )

    const trigger = screen.getByRole("button", { name: "Open filters" })
    expect(trigger.querySelector("button")).toBeNull()

    await user.click(trigger)
    const content = await waitFor(() => {
      const node = document.querySelector("[data-slot=popover-content]")
      expect(node).toBeTruthy()
      return node as HTMLElement
    })

    expect(screen.getByText("Limit the table.")).toBeVisible()
    await waitFor(() => {
      expect(focusIsInside(content)).toBe(true)
    })

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(
        document.querySelector("[data-slot=popover-content]")
      ).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })

  it("uses the child as the trigger when asChild is set", async () => {
    const user = createUser()
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Custom trigger</button>
        </PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>
    )

    const trigger = screen.getByRole("button", { name: "Custom trigger" })
    expect(trigger.tagName).toBe("BUTTON")
    expect(trigger.querySelector("button")).toBeNull()

    await user.click(trigger)
    expect(await screen.findByText("Panel")).toBeVisible()
  })
})

describe("Dialog", () => {
  it("opens, moves focus in, and returns it to the trigger on close", async () => {
    const user = createUser()
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button">Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Archive</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByRole("button", { name: "Open dialog" })
    await user.click(trigger)

    const dialog = await screen.findByRole("dialog")
    expect(dialog).toHaveAccessibleName("Archive")
    expect(screen.getByText("This cannot be undone.")).toBeVisible()
    await waitFor(() => {
      expect(focusIsInside(dialog)).toBe(true)
    })

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })

  it("uses the child as the trigger when asChild is set", async () => {
    const user = createUser()
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button type="button">Custom dialog trigger</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Details</DialogTitle>
          <DialogDescription>More information.</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByRole("button", {
      name: "Custom dialog trigger",
    })
    expect(trigger.querySelector("button")).toBeNull()

    await user.click(trigger)
    expect(await screen.findByRole("dialog")).toHaveAccessibleName("Details")
  })
})
