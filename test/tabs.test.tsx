import type * as React from "react"
import { fireEvent } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DRAG_THRESHOLD } from "../src/internal/use-drag-scroll.js"
import { TabsNavLink } from "../src/next/tabs-nav-link.js"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsNav,
  TabsNavLink as BaseTabsNavLink,
  TabsTrigger,
  tabsTriggerVariants,
} from "../src/tabs.js"
import {
  TabsNavNarrowStory,
  TabsNavStory,
  TabsOverflowStory,
} from "../stories/navigation.js"

import { createUser, render, screen, waitFor } from "./helpers.js"

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

/**
 * jsdom has no layout, so every element reports an 800px row in a 390px
 * box while `run` executes: the scroller overflows, joins the tab order and
 * takes mouse drags.
 */
async function withOverflow(run: () => Promise<void>) {
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
    await run()
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
}

const mouse = { pointerType: "mouse", pointerId: 1, button: 0 }

/** Press at `from`, move to `to` and release, the way a mouse drag arrives. */
function dragWithMouse(target: Element, from: number, to: number) {
  fireEvent.pointerDown(target, { ...mouse, buttons: 1, clientX: from })
  fireEvent.pointerMove(target, { ...mouse, buttons: 1, clientX: to })
  fireEvent.pointerUp(target, { ...mouse, buttons: 0, clientX: to })
}

/** The scroller once `useHorizontalOverflow` has seen the overflow. */
async function overflowingScroller(element: HTMLElement) {
  const scroller = scrollerOf(element) as HTMLElement
  await waitFor(() => {
    expect(scroller).toHaveAttribute("tabindex", "0")
  })
  return scroller
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
 * that padding (`h-9` = `h-7` + `p-1`×2) so the list fits the content box
 * and the outer row matches `Button` `size="sm"`.
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
  // Plain classes chosen from the orientation, so a consumer `className`
  // such as `h-9` replaces them (a `group-data-[...]:h-7` variant would win).
  expect(listClasses).toContain("h-7")
  const line = scrollerClasses.includes("pb-2")
  expect(scrollerClasses).toContain(line ? "h-10" : "h-9")
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
    await withOverflow(async () => {
      const { container } = render(<TabsNavStory />)
      const scroller = container.querySelector("[data-slot=tabs-scroller]")
      await waitFor(() => {
        expect(scroller).toHaveAttribute("tabindex", "0")
      })
    })
  })

  it("stays out of the tab order and ignores mouse drags while the row fits", () => {
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault())
    render(
      <TabsNav aria-label="Settings">
        <BaseTabsNavLink href="#activity" active onClick={onClick}>
          Activity
        </BaseTabsNavLink>
      </TabsNav>
    )
    const link = screen.getByRole("link", { name: "Activity" })
    const scroller = scrollerOf(link) as HTMLElement
    expect(scroller).not.toHaveAttribute("tabindex")
    scroller.scrollLeft = 100
    dragWithMouse(link, 200, 100)
    expect(scroller.scrollLeft).toBe(100)
    fireEvent.click(link)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

const persistentLabels = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
]

function PersistentNav({ active }: { active: string }) {
  return (
    <TabsNav aria-label="Views">
      {persistentLabels.map((label) => (
        <a
          key={label}
          href={`#${label}`}
          className={tabsTriggerVariants()}
          aria-current={label === active ? "page" : undefined}
        >
          {label}
        </a>
      ))}
    </TabsNav>
  )
}

describe("TabsNav in a persistent layout", () => {
  const original = HTMLElement.prototype.scrollIntoView
  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = original
  })

  // Found in the 1.0 audit; failed before its fix.
  it("reveals the new active link when the route changes without remount", () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView
    const { rerender } = render(<PersistentNav active="Alpha" />)
    expect(scrollIntoView.mock.instances).toEqual([
      screen.getByRole("link", { name: "Alpha" }),
    ])

    rerender(<PersistentNav active="Foxtrot" />)
    expect(scrollIntoView.mock.instances.at(-1)).toBe(
      screen.getByRole("link", { name: "Foxtrot" })
    )

    // Re-renders that keep the same active link do not scroll again.
    rerender(<PersistentNav active="Foxtrot" />)
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
  })
})

describe("TabsNav mouse drag", () => {
  function renderLinks(onClick: (event: React.MouseEvent) => void) {
    render(
      <TabsNav aria-label="Settings">
        <BaseTabsNavLink href="#activity" active onClick={onClick}>
          Activity
        </BaseTabsNavLink>
        <BaseTabsNavLink href="#preferences" active={false} onClick={onClick}>
          Preferences
        </BaseTabsNavLink>
      </TabsNav>
    )
    return screen.getByRole("link", { name: "Preferences" })
  }

  it("scrolls the row by the drag distance both ways without following the link", async () => {
    await withOverflow(async () => {
      const onClick = vi.fn()
      const link = renderLinks(onClick)
      const scroller = await overflowingScroller(link)
      scroller.scrollLeft = 100

      // Right to left: the content follows the pointer, so scrollLeft grows.
      dragWithMouse(link, 200, 170)
      expect(scroller.scrollLeft).toBe(130)
      // The browser fires the click after pointerup; the drag swallows it.
      expect(fireEvent.click(link)).toBe(false)
      expect(onClick).not.toHaveBeenCalled()

      // Left to right.
      dragWithMouse(link, 200, 260)
      expect(scroller.scrollLeft).toBe(70)
      expect(fireEvent.click(link)).toBe(false)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  it("keeps a plain click on a link working", async () => {
    await withOverflow(async () => {
      const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault())
      const link = renderLinks(onClick)
      const scroller = await overflowingScroller(link)
      scroller.scrollLeft = 100

      // A press that wobbles less than the threshold is still a click.
      fireEvent.pointerDown(link, { ...mouse, buttons: 1, clientX: 200 })
      fireEvent.pointerMove(link, {
        ...mouse,
        buttons: 1,
        clientX: 200 + DRAG_THRESHOLD - 1,
      })
      fireEvent.pointerUp(link, { ...mouse, buttons: 0, clientX: 203 })
      fireEvent.click(link)
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(scroller.scrollLeft).toBe(100)

      // The full browser sequence for a click, with no movement at all.
      await createUser().click(link)
      expect(onClick).toHaveBeenCalledTimes(2)
      expect(scroller.scrollLeft).toBe(100)
    })
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

describe("TabsNavLink", () => {
  const linkClass = (markup: string) =>
    /<a[^>]*class="([^"]*)"/.exec(markup)?.[1]

  it("renders a plain anchor with the trigger chrome and the active marks", () => {
    const plain = renderToStaticMarkup(
      <TabsNav aria-label="Preview views">
        <BaseTabsNavLink href="#list" active>
          List
        </BaseTabsNavLink>
        <BaseTabsNavLink href="#board" active={false}>
          Board
        </BaseTabsNavLink>
      </TabsNav>
    )
    expect(plain).toMatch(
      /<a[^>]*data-slot="tabs-nav-link"[^>]*data-state="active"[^>]*aria-current="page"[^>]*href="#list"[^>]*>List<\/a>/
    )
    expect(plain).toMatch(
      /<a[^>]*data-state="inactive"[^>]*href="#board"[^>]*>Board<\/a>/
    )
    expect(plain.match(/aria-current="page"/g)).toHaveLength(1)
    // Same classes as the Next adapter, so both paths share the active style.
    expect(linkClass(plain)).toBe(linkClass(html))
    expect(linkClass(plain)).toContain("bg-selected")
  })

  it("merges the chrome onto a child with asChild", () => {
    render(
      <TabsNav aria-label="Preview views">
        <BaseTabsNavLink asChild active>
          <a href="#list">List</a>
        </BaseTabsNavLink>
      </TabsNav>
    )
    const link = screen.getByRole("link", { name: "List" })
    expect(link).toHaveAttribute("data-slot", "tabs-nav-link")
    expect(link).toHaveAttribute("aria-current", "page")
    expect(link.className).toBe(tabsTriggerVariants())
  })

  it("renders the same markup through the Next adapter", () => {
    // The adapter wraps the base link with asChild around a Next Link, so
    // the DOM must not differ from the core export.
    expect(html).toBe(
      renderToStaticMarkup(
        <TabsNav aria-label="Items view">
          <BaseTabsNavLink href="/items?view=pipeline" active>
            Pipeline
          </BaseTabsNavLink>
          <BaseTabsNavLink href="/items?view=table" active={false}>
            Table
          </BaseTabsNavLink>
        </TabsNav>
      )
    )
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

  it("takes the same mouse drag as TabsNav and keeps plain clicks", async () => {
    await withOverflow(async () => {
      const onClick = vi.fn()
      render(
        <Tabs defaultValue="overview">
          <TabsList aria-label="Order">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity" onClick={onClick}>
              Activity
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview panel</TabsContent>
          <TabsContent value="activity">Activity panel</TabsContent>
        </Tabs>
      )
      const tab = screen.getByRole("tab", { name: "Activity" })
      const scroller = await overflowingScroller(tab)
      scroller.scrollLeft = 100

      dragWithMouse(tab, 200, 150)
      expect(scroller.scrollLeft).toBe(150)
      expect(fireEvent.click(tab)).toBe(false)
      expect(onClick).not.toHaveBeenCalled()

      // Radix selects on press, so a plain click still switches the tab.
      await createUser().click(tab)
      expect(tab).toHaveAttribute("aria-selected", "true")
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(scroller.scrollLeft).toBe(150)
    })
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
