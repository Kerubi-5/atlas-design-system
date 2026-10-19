import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { NavLink, isNavActive, navLinkVariants } from "../src/nav-link.js"
import { NavLink as NextNavLink } from "../src/next/nav-link.js"
import { NavLinkAsChildStory, NavLinkShellStory } from "../stories/nav-link.js"

import { render, screen } from "./helpers.js"

const html = renderToStaticMarkup(
  <nav aria-label="App">
    <NavLink href="/calendar" active>
      Calendar
    </NavLink>
    <NavLink href="/tasks" active={false}>
      Tasks
    </NavLink>
  </nav>
)

const linkClass = (markup: string, label: string) =>
  new RegExp(`<a[^>]*class="([^"]*)"[^>]*>${label}</a>`).exec(markup)?.[1]

describe("NavLink", () => {
  it("renders labelled links without a router", () => {
    expect(html).toMatch(/^<nav[^>]*aria-label="App"/)
    expect(html).toMatch(/<a[^>]*href="\/calendar"/)
    expect(html).toMatch(/<a[^>]*href="\/tasks"/)
  })

  it("marks only the active link as the current page", () => {
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*>Calendar<\/a>/)
    expect(html).toMatch(/data-state="active"/)
    expect(html).toMatch(/data-state="inactive"/)
  })

  it("uses pill chrome: muted inactive, selected active, accent hover", () => {
    const classes = navLinkVariants().split(/\s+/)
    expect(classes).toContain("rounded-none")
    expect(classes).toContain("px-3")
    expect(classes).toContain("py-1.5")
    expect(classes).toContain("text-muted-foreground")
    expect(classes).toContain("hover:bg-accent")
    expect(classes).toContain("data-[state=active]:bg-selected")
    expect(classes).toContain("data-[state=active]:text-selected-foreground")
    expect(classes).toContain("data-[state=active]:border-selected-foreground")
    expect(classes).toContain("data-[state=active]:font-medium")
    expect(classes).toContain("focus-visible:ring-ring")

    const calendar = linkClass(html, "Calendar")
    const tasks = linkClass(html, "Tasks")
    expect(calendar).toBe(navLinkVariants())
    expect(tasks).toBe(navLinkVariants())
  })

  it("renders the shell story as a labelled nav of three links", () => {
    render(<NavLinkShellStory />)
    expect(screen.getByRole("navigation", { name: "App" })).toBeVisible()
    const links = screen.getAllByRole("link")
    expect(links.map((link) => link.textContent)).toEqual([
      "Calendar",
      "Tasks",
      "Settings",
    ])
    expect(screen.getByRole("link", { name: "Calendar" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByRole("link", { name: "Tasks" })).not.toHaveAttribute(
      "aria-current"
    )
    expect(screen.getByRole("link", { name: "Calendar" })).toHaveAttribute(
      "data-slot",
      "nav-link"
    )
  })

  it("merges styles onto a child when asChild is set", () => {
    render(<NavLinkAsChildStory active="Tasks" />)
    const tasks = screen.getByRole("link", { name: "Tasks" })
    expect(tasks.tagName).toBe("A")
    expect(tasks).toHaveAttribute("aria-current", "page")
    expect(tasks).toHaveAttribute("data-state", "active")
    expect(tasks.className.split(/\s+/)).toContain(
      "data-[state=active]:bg-selected"
    )
    expect(screen.getByRole("link", { name: "Calendar" })).toHaveAttribute(
      "data-state",
      "inactive"
    )
  })
})

describe("isNavActive", () => {
  it("matches the path itself and pages under it, not a sibling prefix", () => {
    expect(isNavActive("/tasks", "/tasks")).toBe(true)
    expect(isNavActive("/tasks/42", "/tasks")).toBe(true)
    expect(isNavActive("/tasks/42/edit", "/tasks")).toBe(true)
    expect(isNavActive("/tasks-archive", "/tasks")).toBe(false)
    expect(isNavActive("/calendar", "/tasks")).toBe(false)
    expect(isNavActive("/", "/tasks")).toBe(false)
  })

  it("treats the root as active only on the root", () => {
    expect(isNavActive("/", "/")).toBe(true)
    expect(isNavActive("/tasks", "/")).toBe(false)
  })
})

describe("next/nav-link", () => {
  const nextHtml = renderToStaticMarkup(
    <>
      <NextNavLink href="/calendar" active>
        Calendar
      </NextNavLink>
      <NextNavLink href="/tasks" active={false}>
        Tasks
      </NextNavLink>
    </>
  )

  it("is a Next Link with the same pill classes as the core export", () => {
    expect(nextHtml).toMatch(/<a[^>]*href="\/calendar"/)
    expect(nextHtml).toMatch(/<a[^>]*href="\/tasks"/)
    expect(nextHtml.match(/aria-current="page"/g)).toHaveLength(1)
    expect(nextHtml).toMatch(/data-state="inactive"/)
    expect(linkClass(nextHtml, "Calendar")).toBe(navLinkVariants())
    expect(linkClass(nextHtml, "Calendar")).toBe(linkClass(html, "Calendar"))
  })

  it("renders the same markup as the core NavLink", () => {
    // The adapter wraps the base NavLink with asChild, so the DOM must not
    // differ from a plain anchor rendered by the core export.
    expect(nextHtml).toBe(
      renderToStaticMarkup(
        <>
          <NavLink href="/calendar" active>
            Calendar
          </NavLink>
          <NavLink href="/tasks" active={false}>
            Tasks
          </NavLink>
        </>
      )
    )
    expect(nextHtml).toMatch(/<a[^>]*data-slot="nav-link"/)
  })
})
