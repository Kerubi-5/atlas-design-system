import { describe, expect, it } from "vitest"

import { Calendar } from "../src/calendar.js"
import { Combobox } from "../src/combobox.js"
import { Table, TableBody, TableCell, TableRow } from "../src/table.js"

import { render, screen, waitFor } from "./helpers.js"

describe("accessible names", () => {
  it("names calendar days with the visible number, not an ordinal", () => {
    render(
      <Calendar
        mode="single"
        locale={{ code: "en-US" }}
        defaultMonth={new Date(2026, 9, 1)}
        selected={new Date(2026, 9, 9)}
      />
    )
    expect(
      screen.getByRole("button", { name: "Tuesday, October 27, 2026" })
    ).toHaveTextContent("27")
    expect(
      screen.getByRole("button", { name: "Friday, October 9, 2026, selected" })
    ).toHaveTextContent("9")
    expect(
      screen.queryByRole("button", { name: /\d(st|nd|rd|th)\b/ })
    ).toBeNull()
  })

  it("lets an unlabelled Combobox take an aria-label", () => {
    render(
      <Combobox
        options={[{ value: "usd", label: "US Dollar" }]}
        onValueChange={() => {}}
        aria-label="Currency"
      />
    )
    expect(screen.getByRole("combobox", { name: "Currency" })).toBeVisible()
  })
})

describe("Table scroll region", () => {
  function renderTable() {
    return render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Wide content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  it("stays out of the tab order when nothing overflows", () => {
    const { container } = renderTable()
    const scroller = container.querySelector("[data-slot=table-container]")
    expect(scroller).not.toHaveAttribute("tabindex")
  })

  it("joins the tab order while its content is wider than the box", async () => {
    const descriptors = {
      scrollWidth: Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "scrollWidth"
      ),
      clientWidth: Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "clientWidth"
      ),
    }
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get: () => 800,
    })
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 390,
    })
    try {
      const { container } = renderTable()
      const scroller = container.querySelector("[data-slot=table-container]")
      await waitFor(() => {
        expect(scroller).toHaveAttribute("tabindex", "0")
      })
    } finally {
      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (descriptor) {
          Object.defineProperty(HTMLElement.prototype, key, descriptor)
        } else {
          delete (HTMLElement.prototype as unknown as Record<string, unknown>)[
            key
          ]
        }
      }
    }
  })
})
