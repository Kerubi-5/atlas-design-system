import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import {
  ariaDisabledState,
  choiceHitArea,
  controlSize,
  disabledState,
  fieldSurface,
  focusRing,
  hitArea44,
  invalidState,
  optionState,
  sectionLabel,
  selectedState,
} from "../src/internal/styles.js"

/**
 * Shared states live once, in `src/internal/styles.ts`. A component that
 * types one by hand drifts: before this test, Toggle's invalid state had no
 * ring and a destructive Badge drew a translucent focus ring.
 */
const srcDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src"
)
const components = readdirSync(srcDir, { recursive: true, encoding: "utf8" })
  .filter((file) => /\.tsx?$/.test(file) && !file.startsWith("internal"))
  .map((file) => [file, readFileSync(path.join(srcDir, file), "utf8")] as const)

const retyped: Array<[string, RegExp, string]> = [
  [
    "focus ring",
    /(?<![\w-])focus-visible:(?:border-ring|ring-ring|ring-2)\b/,
    "focusRing",
  ],
  ["invalid state", /aria-invalid:(?:border|ring)-destructive/, "invalidState"],
  [
    "disabled state",
    /(?<![\w-])disabled:opacity-50|data-disabled:opacity-50/,
    "disabledState or dataDisabledState",
  ],
  ["field surface", /border border-input bg-background px-3/, "fieldSurface"],
  [
    "selected chrome",
    /(?:hover|aria-expanded|aria-pressed|aria-checked|data-on|data-\[active=true\]|data-\[state=(?:on|"?active"?|checked)\]):bg-selected/,
    "selectedState",
  ],
  ["option highlight bar", /inset_2px_0_0_var\(--color-ring\)/, "optionState"],
  ["aria-disabled state", /aria-disabled:opacity-50/, "ariaDisabledState"],
  ["choice hit area", /after:-inset-x-3 after:-inset-y-2/, "choiceHitArea"],
  ["44px hit area", /after:size-11/, "hitArea44"],
  [
    "control size padding",
    /has-data-\[icon=inline-end\]:pr-[345] has-data-\[icon=inline-start\]:pl-[345]/,
    "controlSize",
  ],
  [
    "section label",
    /text-xs font-semibold tracking-widest text-muted-foreground uppercase/,
    "sectionLabel",
  ],
  ["clamp", /Math\.min\([^()]*Math\.max\(/, "clamp from internal/math"],
  [
    "overlay surface",
    /bg-popover text-popover-foreground shadow-md ring-1/,
    "overlaySurface",
  ],
  [
    "overlay side slide",
    /data-\[side=bottom\]:slide-in-from-top-2/,
    "overlaySideSlide",
  ],
  [
    "overlay fade",
    /data-(?:open|\[state=open\]):animate-in data-(?:open|\[state=open\]):fade-in-0/,
    "overlayFade or overlayFadeZoom",
  ],
  [
    "option row",
    /cursor-default items-center gap-2(?:\.5)? rounded-none py-2/,
    "optionRow",
  ],
  [
    "menu label",
    /text-xs font-semibold tracking-wider text-muted-foreground uppercase/,
    "menuLabel",
  ],
]

describe("shared state classes", () => {
  it("finds the components", () => {
    expect(components.length).toBeGreaterThan(40)
  })

  for (const [what, pattern, shared] of retyped) {
    it(`no component retypes the ${what} (use ${shared})`, () => {
      const offenders = components
        .filter(([, source]) => pattern.test(source))
        .map(([file]) => file)
      expect(offenders).toEqual([])
    })
  }

  it("keeps each shared state complete", () => {
    expect(focusRing).toContain("focus-visible:ring-ring")
    expect(invalidState).toContain("aria-invalid:border-destructive")
    expect(disabledState).toContain("disabled:opacity-50")
    expect(fieldSurface).toContain("border-input")
    for (const chrome of Object.values(selectedState)) {
      expect(chrome).toMatch(/:border-selected-foreground/)
      expect(chrome).toMatch(/:bg-selected/)
    }
    expect(optionState.focus).toContain("--color-ring")
    expect(optionState.active).toContain("--color-ring")
    expect(ariaDisabledState).toContain("aria-disabled:pointer-events-none")
    expect(ariaDisabledState).toContain("aria-disabled:opacity-50")
    expect(choiceHitArea).toContain("after:absolute")
    expect(hitArea44).toContain("after:size-11")
    for (const size of Object.values(controlSize)) {
      expect(size).toMatch(/^h-\d+ px-\d+ /)
    }
    expect(sectionLabel).toContain("tracking-widest")
  })
})
