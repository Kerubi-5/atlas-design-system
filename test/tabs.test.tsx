import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TabsNavLink } from "../src/next/tabs-nav-link.js"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsNav,
  TabsTrigger,
  tabsTriggerVariants,
} from "../src/tabs.js"
import {
  TabsNavNarrowStory,
  TabsNavStory,
  TabsOverflowStory,
} from "../stories/navigation.js"

import { render, screen, waitFor } from "./helpers.js"

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

function scrollerOf(element: HTMLElement | null) {
  return element?.closest("[data-slot=tabs-scroller]") ?? null
}

function expectHorizontalOnlyScroller(element: Element | null) {
  expect(element).toBeTruthy()
  const classes = element?.className.split(/\s+/) ?? []
  expect(classes).toContain("overflow-x-auto")
  expect(classes).toContain("overflow-y-hidden")
  expect(classes).toContain("min-w-0")
  expect(classes).toContain("max-w-full")
  expect(classes).toContain("overscroll-x-contain")
  expect(classes).toContain("p-1")
  expect(classes).toContain("box-border")
  expect(classes).not.toContain("overflow-y-auto")
}

/**
 * `p-1` (0.5rem) sits on the overflow scroller. The used height must include
 * that padding (`h-13` = `h-11` + `p-1`×2) so the list fits the content box.
 * jsdom has no layout, so this is a computed-size check; Playwright asserts
 * `scrollHeight === clientHeight` with `overflow-y` forced off `hidden`.
 */
function expectScrollerFitsList(
  scroller: Element | null,
  list: Element | null
) {
  const scrollerClasses = scroller?.className.split(/\s+/) ?? []
  const listClasses = list?.className.split(/\s+/) ?? []
  expect(scrollerClasses).toContain("p-1")
  expect(scrollerClasses).toContain("box-border")
  expect(listClasses).toContain(
    'group-data-[orientation="horizontal"]/tabs:h-11'
  )
  const line = scrollerClasses.includes("pb-2")
  expect(scrollerClasses).toContain(
    line
      ? 'group-data-[orientation="horizontal"]/tabs:h-14'
      : 'group-data-[orientation="horizontal"]/tabs:h-13'
  )
  if (scroller instanceof HTMLElement) {
    const previous = scroller.style.overflowY
    scroller.style.overflowY = "auto"
    expect(scroller.style.overflowY).not.toBe("hidden")
    expect(scroller.scrollHeight).toBe(scroller.clientHeight)
    scroller.style.overflowY = previous
  }
}

describe("TabsNav", () => {
  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = () => {}
  })

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

  it("owns horizontal overflow so apps do not wrap it in overflow-x-auto", () => {
    const { container } = render(<TabsNavStory />)
    const nav = screen.getByRole("navigation", { name: "Settings" })
    const scroller = container.querySelector("[data-slot=tabs-scroller]")
    const list = container.querySelector("[data-slot=tabs-list]")
    expect(nav.className.split(/\s+/)).toContain("min-w-0")
    expect(nav.className.split(/\s+/)).toContain("max-w-full")
    expectHorizontalOnlyScroller(scroller)
    expectScrollerFitsList(scroller, list)
    expect(list?.className.split(/\s+/)).toContain("min-w-full")
    expect(list?.className.split(/\s+/)).toContain("bg-transparent")
    expect(screen.getAllByRole("link")).toHaveLength(6)
  })

  it("keeps six links inside a 390px panel scroller", () => {
    render(<TabsNavNarrowStory />)
    expect(screen.getByText("Settings").parentElement?.className).toMatch(
      /w-\[390px]/
    )
    expectHorizontalOnlyScroller(
      scrollerOf(screen.getByRole("link", { name: "Activity" }))
    )
    expect(screen.getByRole("link", { name: "Apple Reminders" })).toBeVisible()
  })

  it("scrolls the active link into view on mount", () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView
    render(<TabsNavStory active="Apple Reminders" />)
    expect(scrollIntoView).toHaveBeenCalled()
    const active = screen.getByRole("link", { name: "Apple Reminders" })
    expect(scrollIntoView.mock.instances[0]).toBe(active)
    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ inline: "nearest", block: "nearest" })
    )
  })

  it("joins the tab order while the row is wider than the box", async () => {
    const descriptors = {
      scrollWidth: Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "scrollWidth"
      ),
      clientWidth: Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "clientWidth"
      ),
    }
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get: () => 800,
    })
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 390,
    })
    try {
      const { container } = render(<TabsNavStory />)
      const scroller = container.querySelector("[data-slot=tabs-scroller]")
      await waitFor(() => {
        expect(scroller).toHaveAttribute("tabindex", "0")
      })
    } finally {
      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (descriptor) {
          Object.defineProperty(HTMLElement.prototype, key, descriptor)
        } else {
          delete (HTMLElement.prototype as unknown as Record<string, unknown>)[
            key
          ]
        }
      }
    }
  })
})

describe("tab trigger padding", () => {
  it("uses the same px on every trigger and link, with no flex shrink", () => {
    const classes = tabsTriggerVariants().split(/\s+/)
    expect(classes).toContain("px-4")
    expect(classes).toContain("flex-none")
    expect(classes).not.toContain("flex-1")
    expect(classes.some((token) => token.startsWith("last:"))).toBe(false)
    expect(classes.some((token) => /last-child/.test(token))).toBe(false)
  })

  it("keeps that padding on every Settings link and trigger", () => {
    render(<TabsNavStory />)
    const links = screen.getAllByRole("link")
    expect(links.map((link) => link.textContent)).toEqual([
      "Activity",
      "Preferences",
      "Notifications",
      "API Tokens",
      "Calendar feed",
      "Apple Reminders",
    ])
    for (const link of links) {
      const classes = link.className.split(/\s+/)
      expect(classes).toContain("px-4")
      expect(classes).toContain("flex-none")
    }

    render(<TabsOverflowStory />)
    for (const tab of screen.getAllByRole("tab")) {
      const classes = tab.className.split(/\s+/)
      expect(classes).toContain("px-4")
      expect(classes).toContain("flex-none")
    }
  })
})

describe("TabsNav without Next", () => {
  it("styles plain links with the public trigger variants", () => {
    const plain = renderToStaticMarkup(
      <TabsNav aria-label="Preview views">
        <a
          href="#list"
          data-state="active"
          aria-current="page"
          className={tabsTriggerVariants()}
        >
          List
        </a>
      </TabsNav>
    )
    // Same classes as the Next adapter, so both paths share the active style.
    const linkClass = (markup: string) =>
      /<a[^>]*class="([^"]*)"/.exec(markup)?.[1]
    expect(linkClass(plain)).toContain("bg-selected")
    expect(linkClass(plain)).toBe(linkClass(html))
  })
})

describe("TabsList overflow", () => {
  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = () => {}
  })

  it("uses the same horizontal-only scroller as TabsNav", () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList aria-label="Order">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
      </Tabs>
    )
    const list = screen.getByRole("tablist", { name: "Order" })
    const scroller = scrollerOf(list)
    expectHorizontalOnlyScroller(scroller)
    expectScrollerFitsList(scroller, list)
    expect(list.className.split(/\s+/)).toContain("min-w-full")
  })

  it("scrolls the active trigger into view on mount", () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView
    render(<TabsOverflowStory />)
    const active = screen.getByRole("tab", { name: "Activity" })
    expect(scrollIntoView.mock.instances[0]).toBe(active)
  })

  it("treats a missing list variant as default", () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList variant={null} aria-label="Order">
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
      </Tabs>
    )
    const list = screen.getByRole("tablist", { name: "Order" })
    const scroller = scrollerOf(list)
    expect(scroller).toHaveAttribute("data-variant", "default")
    expect(scroller?.className.split(/\s+/)).not.toContain("pb-2")
    expectScrollerFitsList(scroller, list)
  })

  it("gives the line variant extra bottom padding for the underline", () => {
    render(
      <Tabs defaultValue="list">
        <TabsList variant="line" aria-label="Views">
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="list">List panel</TabsContent>
      </Tabs>
    )
    const list = screen.getByRole("tablist", { name: "Views" })
    const scroller = scrollerOf(list)
    expect(scroller?.className.split(/\s+/)).toContain("pb-2")
    expect(scroller).toHaveAttribute("data-variant", "line")
    expectScrollerFitsList(scroller, list)
  })
})
