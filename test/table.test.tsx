import { describe, expect, it } from "vitest"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../src/table.js"
import {
  NarrowPanelTableStory,
  ProfileCardTableStory,
} from "../stories/table-overflow.js"

import { render, screen } from "./helpers.js"

describe("Table overflow", () => {
  it("wraps the table in a min-w-0 overflow-x-auto scroller", () => {
    render(
      <Table>
        <TableCaption>People</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    const table = screen.getByRole("table", { name: "People" })
    const container = table.closest("[data-slot=table-container]")
    expect(container).toBeTruthy()
    expect(container?.className.split(/\s+/)).toContain("overflow-x-auto")
    expect(container?.className.split(/\s+/)).toContain("min-w-0")
    expect(container?.className.split(/\s+/)).toContain("max-w-full")
    expect(container?.className.split(/\s+/)).toContain("overscroll-x-contain")
    expect(table.className.split(/\s+/)).toContain("min-w-full")
  })

  it("uses compact padding below sm and the original density from sm up", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>CC BY 4.0</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    const head = screen.getByRole("columnheader", { name: "License" })
    const cell = screen.getByRole("cell", { name: "CC BY 4.0" })
    expect(head.className.split(/\s+/)).toContain("px-2")
    expect(head.className.split(/\s+/)).toContain("sm:px-3")
    expect(cell.className.split(/\s+/)).toContain("px-2")
    expect(cell.className.split(/\s+/)).toContain("sm:p-3")
  })

  it("keeps a wide table inside a 390px panel scroller", () => {
    render(<NarrowPanelTableStory />)

    const table = screen.getByRole("table", { name: "Sources in this build" })
    const container = table.closest("[data-slot=table-container]")
    const panel = screen.getByText("In this build").parentElement

    expect(panel?.className.split(/\s+/)).toContain("w-[390px]")
    expect(container?.className.split(/\s+/)).toContain("overflow-x-auto")
    expect(container?.className.split(/\s+/)).toContain("min-w-0")
    expect(screen.getByRole("columnheader", { name: "License" })).toBeVisible()
    expect(screen.getByRole("cell", { name: "CC BY-NC 4.0" })).toBeVisible()
  })

  it("lets a card shrink in width so nested tables scroll instead of growing it", () => {
    render(<ProfileCardTableStory />)

    const card = screen
      .getByText("Barangay profile")
      .closest("[data-slot=card]")
    const content = card?.querySelector("[data-slot=card-content]")
    const container = screen
      .getByRole("table", { name: "Sources in this build" })
      .closest("[data-slot=table-container]")
    const panel = card?.parentElement

    expect(panel?.className.split(/\s+/)).toContain("w-[390px]")
    expect(card?.className.split(/\s+/)).toContain("min-w-0")
    expect(content?.className.split(/\s+/)).toContain("min-w-0")
    expect(container?.className.split(/\s+/)).toContain("overflow-x-auto")
    expect(container?.className.split(/\s+/)).toContain("min-w-0")
    expect(screen.getByRole("cell", { name: "CC BY-NC 4.0" })).toBeVisible()
  })
})
