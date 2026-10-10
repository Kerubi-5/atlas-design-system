import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { Calendar } from "../src/calendar.js"
import { Combobox } from "../src/combobox.js"
import { tabsTriggerVariants } from "../src/internal/tabs-styles.js"
import { Table, TableBody, TableCell, TableRow } from "../src/table.js"
import { Toggle } from "../src/toggle.js"
import { ToggleGroup, ToggleGroupItem } from "../src/toggle-group.js"

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

describe("focus and state cues (WCAG 1.4.11)", () => {
  const srcDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../src"
  )
  const sources = readdirSync(srcDir, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.tsx?$/.test(file))
    .map(
      (file) => [file, readFileSync(path.join(srcDir, file), "utf8")] as const
    )

  it("draws focus with the solid ring color, never a translucent one", () => {
    expect(sources.length).toBeGreaterThan(20)
    for (const [file, source] of sources) {
      expect(
        source.match(/(focus-visible|\/day):ring-(ring|primary)\/\d+/g),
        file
      ).toBeNull()
    }
  })

  it("marks pressed toggles, toggle-group items, and active tabs with a border", () => {
    render(<Toggle aria-label="Bold" pressed />)
    const toggle = screen.getByRole("button", { name: "Bold" })
    expect(toggle.className).toContain(
      "aria-pressed:border-selected-foreground"
    )
    expect(toggle.className).toContain("data-on:border-selected-foreground")
    render(
      <ToggleGroup type="single" defaultValue="list" aria-label="View">
        <ToggleGroupItem value="list">List</ToggleGroupItem>
      </ToggleGroup>
    )
    const item = screen.getByRole("radio", { name: "List" })
    expect(item).toHaveAttribute("data-state", "on")
    expect(item).toHaveAttribute("aria-checked", "true")
    expect(item).not.toHaveAttribute("aria-pressed")
    expect(item.className).toContain("data-on:border-selected-foreground")
    expect(item.className).toContain("aria-checked:border-selected-foreground")
    expect(tabsTriggerVariants()).toContain(
      'data-[state="active"]:border-selected-foreground'
    )
  })
})
