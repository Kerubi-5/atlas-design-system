import { describe, expect, it, vi } from "vitest"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../src/card.js"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../src/dialog.js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../src/dropdown-menu.js"
import { Markdown } from "../src/markdown.js"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../src/select.js"

import { createUser, render, screen, within } from "./helpers.js"

describe("compound components render every part", () => {
  it("Card: title, description, action, content, and footer", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle as="h2">Orders</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
          <CardAction>
            <button type="button">Export</button>
          </CardAction>
        </CardHeader>
        <CardContent>42 orders</CardContent>
        <CardFooter>Updated today</CardFooter>
      </Card>
    )
    expect(screen.getByRole("heading", { name: "Orders" })).toBeVisible()
    for (const text of ["Last 30 days", "42 orders", "Updated today"]) {
      expect(screen.getByText(text)).toBeVisible()
    }
    expect(screen.getByRole("button", { name: "Export" })).toBeVisible()
  })

  it("Dialog: header, description, footer, and a close button", async () => {
    const user = createUser()
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete order?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    const dialog = screen.getByRole("dialog", { name: "Delete order?" })
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.")
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("DropdownMenu: labels, groups, radio items, shortcuts, and a submenu", async () => {
    const user = createUser()
    const onSort = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Order 1042</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Edit <DropdownMenuShortcut>E</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="newest" onValueChange={onSort}>
            <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    await user.click(screen.getByRole("button", { name: "Actions" }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByText("Order 1042")).toBeVisible()
    expect(within(menu).getByRole("separator")).toBeInTheDocument()
    expect(
      within(menu).getByRole("menuitemradio", { name: "Newest" })
    ).toHaveAttribute("aria-checked", "true")
    await user.click(
      within(menu).getByRole("menuitemradio", { name: "Oldest" })
    )
    expect(onSort).toHaveBeenCalledWith("oldest")

    await user.click(screen.getByRole("button", { name: "Actions" }))
    const reopened = await screen.findByRole("menu")
    const sub = within(reopened).getByRole("menuitem", { name: "Move to" })
    expect(sub).toHaveAttribute("aria-haspopup", "menu")
    sub.focus()
    await user.keyboard("{ArrowRight}")
    expect(
      await screen.findByRole("menuitem", { name: "Archive" })
    ).toBeVisible()
  })

  it("Select: grouped options with a label and separator", async () => {
    const user = createUser()
    render(
      <Select>
        <SelectTrigger aria-label="Timezone">
          <SelectValue placeholder="Pick a timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="ny">New York</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="lon">London</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    await user.click(screen.getByRole("combobox", { name: "Timezone" }))
    const listbox = await screen.findByRole("listbox")
    expect(within(listbox).getAllByRole("group")).toHaveLength(2)
    expect(within(listbox).getByRole("group", { name: "Europe" })).toBeVisible()
    await user.click(within(listbox).getByRole("option", { name: "London" }))
    expect(
      screen.getByRole("combobox", { name: "Timezone" })
    ).toHaveTextContent("London")
  })

  it("Markdown: headings, lists, quotes, code, tables, rules, and images", () => {
    render(
      <Markdown
        content={[
          "# Title",
          "## Section",
          "### Detail",
          "Text with `code` and [a link](https://example.com).",
          "- one\n- two",
          "1. first\n2. second",
          "> quoted",
          "```\nconst x = 1\n```",
          "---",
          "| A | B |\n|---|---|\n| 1 | 2 |",
          "![Chart](https://example.com/chart.png)",
        ].join("\n\n")}
      />
    )
    for (const level of [1, 2, 3]) {
      expect(screen.getAllByRole("heading", { level })).toHaveLength(1)
    }
    expect(screen.getAllByRole("list")).toHaveLength(2)
    expect(screen.getByText("quoted").closest("blockquote")).toBeTruthy()
    expect(screen.getByText("const x = 1").closest("pre")).toBeTruthy()
    expect(screen.getByRole("separator")).toBeInTheDocument()
    expect(screen.getByRole("table")).toBeVisible()
    expect(screen.getByRole("columnheader", { name: "A" })).toBeVisible()
    expect(screen.getByRole("img", { name: "Chart" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "a link" })).toHaveAttribute(
      "href",
      "https://example.com"
    )
  })
})
