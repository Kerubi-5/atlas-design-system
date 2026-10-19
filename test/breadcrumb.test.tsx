import { describe, expect, it } from "vitest"

import { BreadcrumbEllipsis } from "../src/breadcrumb.js"
import { BreadcrumbStory } from "../stories/wayfinding.js"

import { render, screen } from "./helpers.js"

describe("Breadcrumb", () => {
  it("marks the current page and labels the landmark", () => {
    render(<BreadcrumbStory />)

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" })
    expect(breadcrumb.querySelector('[aria-current="page"]')).toHaveTextContent(
      "Order 1042"
    )
    expect(screen.getByRole("link", { name: "Orders" })).toHaveAttribute(
      "href",
      "#orders"
    )
    for (const separator of breadcrumb.querySelectorAll(
      "[data-slot=breadcrumb-separator]"
    )) {
      expect(separator).toHaveAttribute("aria-hidden", "true")
    }
  })
})

describe("BreadcrumbEllipsis", () => {
  // Found in the 1.0 audit; failed before its fix.
  it("names a menu trigger that wraps it", () => {
    render(
      <button type="button">
        <BreadcrumbEllipsis />
      </button>
    )
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument()
  })
})
