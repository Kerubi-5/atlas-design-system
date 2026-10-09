import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Combobox } from "../src/combobox.js"
import {
  DatePickerButton,
  formatLocalDate,
  toDate,
} from "../src/date-picker.js"
import { ErrorFallback } from "../src/error-boundary.js"
import { FormDatePickerField } from "../src/form/date-picker-field.js"
import { SortableTableHead } from "../src/sortable-table-head.js"
import { ThemeProvider } from "../src/theme-provider.js"

describe("date helpers", () => {
  it("parses local calendar dates without UTC shifting", () => {
    const date = toDate("2026-10-05")
    expect(date?.getFullYear()).toBe(2026)
    expect(date?.getMonth()).toBe(9)
    expect(date?.getDate()).toBe(5)
    expect(toDate("")).toBeUndefined()
    expect(toDate(undefined)).toBeUndefined()
    expect(toDate("2026-13-40")).toBeUndefined()
  })

  it("round-trips a Date through formatLocalDate", () => {
    const date = new Date(2026, 9, 5)
    expect(formatLocalDate(date)).toBe("2026-10-05")
    expect(toDate(date)).toBe(date)
  })
})

describe("date picker field", () => {
  it("renders a labelled trigger and field error", () => {
    const html = renderToStaticMarkup(
      <FormDatePickerField
        value="2026-10-05"
        onValueChange={() => {}}
        label="Due"
        meta={{ errors: ["Required"] }}
      />
    )
    expect(html).toContain("Due")
    expect(html).toContain("October 5")
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('role="alert"')
    expect(html).toContain("rounded-none")
    expect(html).toContain("text-base")
    expect(html).toContain("px-3")
    expect(html).toContain("border-input")
  })

  it("forwards className onto the labelled trigger", () => {
    const html = renderToStaticMarkup(
      <FormDatePickerField
        value="2026-10-05"
        onValueChange={() => {}}
        label="Due"
        className="w-40"
      />
    )
    expect(html).toContain("w-40")
  })

  it("shows the placeholder when empty", () => {
    const html = renderToStaticMarkup(
      <DatePickerButton value={undefined} onChange={() => {}} />
    )
    expect(html).toContain("Pick a date")
    expect(html).toContain('data-empty="true"')
  })

  it("renders a range trigger with from and to labels", () => {
    const html = renderToStaticMarkup(
      <DatePickerButton
        mode="range"
        value={{ from: "2026-10-05", to: "2026-11-10" }}
        onChange={() => {}}
      />
    )
    expect(html).toContain("October 5")
    expect(html).toContain("November 10")
    expect(html).toContain("rounded-none")
    expect(html).toContain('data-empty="false"')
  })

  it("shows the range placeholder when empty", () => {
    const html = renderToStaticMarkup(
      <DatePickerButton mode="range" value={undefined} onChange={() => {}} />
    )
    expect(html).toContain("Pick a date range")
    expect(html).toContain('data-empty="true"')
  })
})

describe("combobox", () => {
  it("renders a closed searchable trigger with the selected label", () => {
    const html = renderToStaticMarkup(
      <Combobox
        options={[
          { value: "usd", label: "US Dollar" },
          { value: "eur", label: "Euro" },
        ]}
        value="eur"
        onValueChange={() => {}}
      />
    )
    expect(html).toContain('role="combobox"')
    expect(html).toContain("Euro")
    expect(html).not.toContain("US Dollar")
    expect(html).toContain("rounded-none")
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain("text-base")
    expect(html).toContain("px-3")
    expect(html).toContain("border-input")
  })
})

describe("error recovery", () => {
  it("renders retry and reload actions", () => {
    const html = renderToStaticMarkup(
      <ErrorFallback
        message="Could not load this view."
        onRetry={() => {}}
        onReload={() => {}}
      />
    )
    expect(html).toContain('role="alert"')
    expect(html).toContain("Could not load this view.")
    expect(html).toContain("Try again")
    expect(html).toContain("Reload")
    expect(html).toContain("rounded-none")
  })
})

describe("sortable table header", () => {
  it("exposes aria-sort for the active column", () => {
    const sorted = renderToStaticMarkup(
      <table>
        <thead>
          <tr>
            <SortableTableHead sorted direction="desc" onClick={() => {}}>
              Name
            </SortableTableHead>
          </tr>
        </thead>
      </table>
    )
    expect(sorted).toContain('aria-sort="descending"')
    expect(sorted).toContain("Name")
    const idle = renderToStaticMarkup(
      <table>
        <thead>
          <tr>
            <SortableTableHead onClick={() => {}}>Name</SortableTableHead>
          </tr>
        </thead>
      </table>
    )
    expect(idle).toContain('aria-sort="none"')
  })
})

describe("theme provider", () => {
  it("renders children from a client theme wrapper", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider enableShortcut={false}>
        <span>App</span>
      </ThemeProvider>
    )
    expect(html).toContain("App")
  })
})
