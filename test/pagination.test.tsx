import { describe, expect, it } from "vitest"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../src/pagination.js"
import { PaginationStory } from "../stories/wayfinding.js"

import { render, screen } from "./helpers.js"

describe("Pagination", () => {
  it("marks the current page and labels the landmark", () => {
    render(<PaginationStory />)

    const pagination = screen.getByRole("navigation", { name: "Pagination" })
    const current = pagination.querySelector('[aria-current="page"]')
    expect(current).toHaveTextContent("2")
    expect(current?.className).toContain("bg-selected")
    expect(
      screen.getByRole("link", { name: "Go to previous page" })
    ).toHaveAttribute("href", "#page-1")
    expect(
      screen.getByRole("link", { name: "Go to next page" })
    ).toHaveAttribute("href", "#page-3")
  })

  // Found in the 1.0 audit; failed before its fix.
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

  // Found in the 1.0 audit; failed before its fix.
  it("announces a boundary link as disabled and drops its href", () => {
    render(<PaginationPrevious href="?p=0" disabled />)
    const previous = screen.getByRole("link", { name: "Go to previous page" })
    expect(previous).toHaveAttribute("aria-disabled", "true")
    expect(previous).not.toHaveAttribute("href")
  })
})
