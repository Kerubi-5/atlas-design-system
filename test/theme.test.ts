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
})
