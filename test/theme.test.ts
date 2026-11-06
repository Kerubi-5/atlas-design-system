import { describe, expect, it } from "vitest"

import { readRepoFile, srcModules } from "./repo-files.js"

/** Rules in the shipped `theme.css`. */
describe("theme.css", () => {
  // Found in the 1.0 audit; failed before its fix.
  it("stops motion for people who ask for reduced motion", () => {
    const css = readRepoFile("theme.css")
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion"))
    expect(block).toMatch(/animation-duration: 0\.01ms !important/)
    expect(block).toMatch(/transition-duration: 0\.01ms !important/)
  })

  it("themes the dialog scrim as --overlay in light and dark", () => {
    const css = readRepoFile("theme.css")
    expect(css).toMatch(/--color-overlay:\s*var\(--overlay\)/)
    const root = css.slice(css.indexOf(":root {"), css.indexOf("\n.dark {"))
    const dark = css.slice(css.indexOf("\n.dark {"), css.indexOf("\n@layer"))
    expect(root).toMatch(/--overlay:\s*oklch\(0 0 0 \/ 20%\)/)
    expect(dark).toMatch(/--overlay:\s*oklch\(0 0 0 \/ 50%\)/)
  })

  it("exposes a micro type size", () => {
    expect(readRepoFile("theme.css")).toMatch(/--text-micro:\s*0\.625rem/)
  })

  it("kit components do not use chart-1..5", () => {
    const offenders = srcModules()
      .filter(([, source]) =>
        /(?:bg|text|fill|stroke|border)-chart-[1-5]\b|--chart-[1-5]\b/.test(
          source
        )
      )
      .map(([file]) => file)
    expect(offenders).toEqual([])
  })
})
