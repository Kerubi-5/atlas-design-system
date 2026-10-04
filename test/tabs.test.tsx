import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { TabsNav } from "../src/tabs.js"
import { TabsNavLink } from "../src/next/tabs-nav-link.js"

// Real render (no mocks): a view switcher that changes the URL must be links
// in a labelled nav, not a tab widget whose tabs point at panels that don't
// exist.

const html = renderToStaticMarkup(
  <TabsNav aria-label="Items view">
    <TabsNavLink href="/items?view=pipeline" active>
      Pipeline
    </TabsNavLink>
    <TabsNavLink href="/items?view=table" active={false}>
      Table
    </TabsNavLink>
  </TabsNav>
)

describe("TabsNav", () => {
  it("renders a labelled nav of links", () => {
    expect(html).toMatch(/^<nav[^>]*aria-label="Items view"/)
    expect(html).toMatch(/<a[^>]*href="\/items\?view=pipeline"/)
    expect(html).toMatch(/<a[^>]*href="\/items\?view=table"/)
  })

  it("marks only the active link as the current page", () => {
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*>Pipeline<\/a>/)
  })

  it("has no tab roles or panel references", () => {
    expect(html).not.toMatch(/role="tab|aria-controls|aria-selected/)
  })
})
