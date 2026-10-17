import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { focusRing } from "../src/internal/styles.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../src/tabs.js"
import { ToggleGroup, ToggleGroupItem } from "../src/toggle-group.js"
import { render, screen } from "./helpers.js"

/**
 * Gaps found by the pre-1.0 WCAG sweep (site/tests/wcag-behavior.test.mjs).
 * Each case failed before its fix.
 */
const themeCss = readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../theme.css"),
  "utf8"
)

describe("focus in forced colors (WCAG 2.4.7)", () => {
  it("draws keyboard focus as a system-colored outline, since box-shadow rings vanish", () => {
    const block = themeCss.slice(
      themeCss.indexOf("@media (forced-colors: active)")
    )
    expect(block).toMatch(
      /:focus-visible\s*{\s*outline: 2px solid Highlight !important/
    )
  })
})

describe("TabsContent", () => {
  it("shows the focus ring when Tab lands on the panel", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel</TabsContent>
      </Tabs>
    )
    const panel = screen.getByRole("tabpanel")
    for (const name of focusRing.split(" ")) expect(panel).toHaveClass(name)
  })
})

describe("ToggleGroup at 320px (WCAG 1.4.10)", () => {
  it("wraps horizontal items instead of pushing the page sideways", () => {
    render(
      <ToggleGroup type="multiple" aria-label="Format">
        <ToggleGroupItem value="b">Bold</ToggleGroupItem>
      </ToggleGroup>
    )
    const group = screen.getByRole("toolbar", { name: "Format" })
    expect(group).toHaveClass(
      "flex-wrap",
      "max-w-full",
      "data-vertical:flex-nowrap"
    )
  })
})
