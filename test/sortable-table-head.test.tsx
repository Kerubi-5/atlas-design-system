import { useState } from "react"
import { describe, expect, it } from "vitest"

import {
  SortableTableHead,
  type SortDirection,
} from "../src/sortable-table-head.js"
import { Table, TableHeader, TableRow } from "../src/table.js"

import { createUser, render, screen } from "./helpers.js"

function SortableNameColumn() {
  const [sorted, setSorted] = useState(false)
  const [direction, setDirection] = useState<SortDirection>("asc")

  const cycle = () => {
    if (!sorted) {
      setSorted(true)
      setDirection("asc")
      return
    }
    if (direction === "asc") {
      setDirection("desc")
      return
    }
    setSorted(false)
    setDirection("asc")
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            sorted={sorted}
            direction={direction}
            onClick={cycle}
          >
            Name
          </SortableTableHead>
        </TableRow>
      </TableHeader>
    </Table>
  )
}

describe("SortableTableHead", () => {
  it("cycles sort and updates aria-sort on click", async () => {
    const user = createUser()
    render(<SortableNameColumn />)

    const column = screen.getByRole("columnheader", { name: "Name" })
    const button = screen.getByRole("button", { name: "Name" })
    expect(column).toHaveAttribute("aria-sort", "none")

    await user.click(button)
    expect(column).toHaveAttribute("aria-sort", "ascending")

    await user.click(button)
    expect(column).toHaveAttribute("aria-sort", "descending")

    await user.click(button)
    expect(column).toHaveAttribute("aria-sort", "none")
  })

  it("activates the sort control from the keyboard", async () => {
    const user = createUser()
    render(<SortableNameColumn />)

    const column = screen.getByRole("columnheader", { name: "Name" })
    const button = screen.getByRole("button", { name: "Name" })

    button.focus()
    await user.keyboard("{Enter}")
    expect(column).toHaveAttribute("aria-sort", "ascending")

    await user.keyboard(" ")
    expect(column).toHaveAttribute("aria-sort", "descending")
  })
})
