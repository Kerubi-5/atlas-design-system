import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, describe, expect, it, vi } from "vitest"

import { BreadcrumbEllipsis } from "../src/breadcrumb.js"
import { Card, CardTitle } from "../src/card.js"
import { Markdown, safeMarkdownUrl } from "../src/markdown.js"
import { Meter } from "../src/meter.js"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../src/pagination.js"
import { Progress } from "../src/progress.js"
import { Table } from "../src/table.js"
import { TableBodySkeleton } from "../src/table-body-skeleton.js"
import { TabsNav } from "../src/tabs.js"
import { tabsTriggerVariants } from "../src/internal/tabs-styles.js"
import { render, screen } from "./helpers.js"

/**
 * Bugs and accessibility gaps found in the 1.0 audit. Each case failed
 * before its fix.
 */
const indicator = (bar: HTMLElement) =>
  bar.querySelector<HTMLElement>("[data-slot=progress-indicator]")!

describe("Progress range", () => {
  it("draws the fill against max, matching what screen readers hear", () => {
    render(<Progress value={50} max={200} aria-label="Upload" />)
    const bar = screen.getByRole("progressbar", { name: "Upload" })
    expect(bar).toHaveAttribute("aria-valuetext", "25%")
    expect(indicator(bar).style.transform).toBe("translateX(-75%)")
  })

  it("clamps values past max instead of drawing an invalid transform", () => {
    render(<Progress value={120} aria-label="Over" />)
    const bar = screen.getByRole("progressbar", { name: "Over" })
    expect(bar).toHaveAttribute("aria-valuenow", "100")
    expect(indicator(bar).style.transform).toBe("translateX(-0%)")
  })

  it("treats NaN as indeterminate and draws an empty bar", () => {
    render(<Progress value={Number.NaN} aria-label="Broken" />)
    const bar = screen.getByRole("progressbar", { name: "Broken" })
    expect(bar).toHaveAttribute("data-state", "indeterminate")
    expect(indicator(bar).style.transform).toBe("translateX(-100%)")
  })
})

describe("Meter with a NaN reading", () => {
  it("announces and draws the minimum", () => {
    render(<Meter value={Number.NaN} max={100} aria-label="Spend" />)
    const meter = screen.getByRole("meter", { name: "Spend" })
    expect(meter).toHaveAttribute("aria-valuenow", "0")
    const fill = meter.querySelector<HTMLElement>("[data-slot=meter-fill]")!
    expect(fill.style.width).toBe("0%")
  })
})

describe("Markdown", () => {
  it("rejects protocol-relative URLs that look like root paths", () => {
    expect(safeMarkdownUrl("//evil.example/login")).toBe("")
    expect(safeMarkdownUrl("/\\evil.example/login")).toBe("")
    expect(safeMarkdownUrl("/settings")).toBe("/settings")
  })

  it("keeps GFM column alignment", () => {
    render(
      <Markdown content={"| Item | Amount |\n| :-- | --: |\n| Tea | 4.50 |"} />
    )
    expect(screen.getByRole("cell", { name: "4.50" }).style.textAlign).toBe(
      "right"
    )
    expect(
      screen.getByRole("columnheader", { name: "Amount" }).style.textAlign
    ).toBe("right")
  })

  it("shows the alt text instead of a broken image for an unsafe URL", () => {
    const { container } = render(
      <Markdown content={"![Chart](javascript:alert(1))"} />
    )
    expect(container.querySelector("img")).toBeNull()
    expect(screen.getByText("Chart")).toBeInTheDocument()
  })
})

describe("TableBodySkeleton", () => {
  it("marks the body busy and hides the placeholder rows", () => {
    render(
      <Table aria-label="Orders">
        <TableBodySkeleton columns={3} rows={2} />
      </Table>
    )
    const table = screen.getByRole("table", { name: "Orders" })
    expect(table.querySelector("tbody")).toHaveAttribute("aria-busy", "true")
    expect(screen.queryAllByRole("cell")).toEqual([])
  })
})

describe("Pagination", () => {
  it("names Previous and Next by their custom text", () => {
    render(
      <Pagination aria-label="Paginación">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="?p=1">Anterior</PaginationPrevious>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="?p=3">Siguiente</PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    expect(screen.getByRole("link", { name: "Anterior" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Siguiente" })).toBeInTheDocument()
  })

  it("keeps the default names", () => {
    render(<PaginationNext href="?p=2" />)
    expect(
      screen.getByRole("link", { name: "Go to next page" })
    ).toHaveAttribute("href", "?p=2")
  })

  it("announces a boundary link as disabled and drops its href", () => {
    render(<PaginationPrevious href="?p=0" disabled />)
    const previous = screen.getByRole("link", { name: "Go to previous page" })
    expect(previous).toHaveAttribute("aria-disabled", "true")
    expect(previous).not.toHaveAttribute("href")
  })
})

describe("BreadcrumbEllipsis", () => {
  it("names a menu trigger that wraps it", () => {
    render(
      <button type="button">
        <BreadcrumbEllipsis />
      </button>
    )
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument()
  })
})

describe("CardTitle", () => {
  it("can be a section heading", () => {
    render(
      <Card>
        <CardTitle as="h2">Spending</CardTitle>
      </Card>
    )
    expect(
      screen.getByRole("heading", { level: 2, name: "Spending" })
    ).toBeInTheDocument()
  })
})

const labels = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot"]

function Nav({ active }: { active: string }) {
  return (
    <TabsNav aria-label="Views">
      {labels.map((label) => (
        <a
          key={label}
          href={`#${label}`}
          className={tabsTriggerVariants()}
          aria-current={label === active ? "page" : undefined}
        >
          {label}
        </a>
      ))}
    </TabsNav>
  )
}

describe("TabsNav in a persistent layout", () => {
  const original = HTMLElement.prototype.scrollIntoView
  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = original
  })

  it("reveals the new active link when the route changes without remount", () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView
    const { rerender } = render(<Nav active="Alpha" />)
    expect(scrollIntoView.mock.instances).toEqual([
      screen.getByRole("link", { name: "Alpha" }),
    ])

    rerender(<Nav active="Foxtrot" />)
    expect(scrollIntoView.mock.instances.at(-1)).toBe(
      screen.getByRole("link", { name: "Foxtrot" })
    )

    // Re-renders that keep the same active link do not scroll again.
    rerender(<Nav active="Foxtrot" />)
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
  })
})

describe("theme.css", () => {
  it("stops motion for people who ask for reduced motion", () => {
    const css = readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../theme.css"
      ),
      "utf8"
    )
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion"))
    expect(block).toMatch(/animation-duration: 0\.01ms !important/)
    expect(block).toMatch(/transition-duration: 0\.01ms !important/)
  })
})
