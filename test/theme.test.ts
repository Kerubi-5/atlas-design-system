import { describe, expect, it } from "vitest"

import { readRepoFile } from "./repo-files.js"

/** Rules in the shipped `theme.css`. */
describe("theme.css", () => {
  // Found in the 1.0 audit; failed before its fix.
  it("stops motion for people who ask for reduced motion", () => {
    const css = readRepoFile("theme.css")
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion"))
    expect(block).toMatch(/animation-duration: 0\.01ms !important/)
    expect(block).toMatch(/transition-duration: 0\.01ms !important/)
  })

  it("collapses extra pagination pages from one keeper list and item size", () => {
    const css = readRepoFile("theme.css")
    const block = css.slice(
      css.indexOf("Pagination that no longer fits"),
      css.indexOf('[data-slot="card"]')
    )
    expect(block).toContain("n * 2.5rem")
    expect(block).toContain("size-9")
    expect(block).toContain("gap-1")
    expect(block).toContain(":nth-last-child(2)")
    expect(block).toContain('[data-slot="pagination-ellipsis"]')
    expect(block).toMatch(/@container pagination \(width < 7\.5rem\)/)
    expect(block).toMatch(/@container pagination \(width < 10rem\)/)
    expect(block).toMatch(/@container pagination \(width < 30rem\)/)
    expect(block).not.toContain(":not(:has(> li:nth-child(5)))")
  })

  it("overrides Sonner toast CSS with tokens instead of important", () => {
    const css = readRepoFile("theme.css")
    const start = css.indexOf("Sonner injects unlayered CSS")
    expect(start).toBeGreaterThan(-1)
    const block = css.slice(start)
    expect(block).toContain(
      "box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow)"
    )
    expect(block).toContain("background-color: var(--color-popover)")
    expect(block).toContain("border-color: var(--color-border)")
    expect(block).toContain("color: var(--color-muted-foreground)")
    expect(block).toContain("width: 100%")
    expect(block).not.toContain("!important")
  })
})
