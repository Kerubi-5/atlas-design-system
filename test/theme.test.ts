import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

/** Rules in the shipped `theme.css`. */
describe("theme.css", () => {
  // Found in the 1.0 audit; failed before its fix.
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
