import { describe, expect, it, vi } from "vitest"

import { PeriodStepper as NextPeriodStepper } from "../src/next/period-stepper.js"
import { PageHeader } from "../src/page-header.js"
import { PeriodStepper } from "../src/period-stepper.js"
import { SkipLink } from "../src/skip-link.js"

import { createUser, render, screen } from "./helpers.js"

describe("PageHeader", () => {
  it("renders the page heading, hint, extra content, and actions", () => {
    render(
      <PageHeader
        title="Projects"
        description="Group tasks into projects."
        actions={<button type="button">New project</button>}
        className="mb-2"
      >
        <span>3 active</span>
      </PageHeader>
    )
    const heading = screen.getByRole("heading", { level: 1, name: "Projects" })
    expect(heading).toHaveAttribute("data-slot", "page-header-title")
    const header = document.querySelector('[data-slot="page-header"]')!
    expect(header.tagName).toBe("HEADER")
    expect(header).toHaveClass("mb-2")
    expect(screen.getByText("Group tasks into projects.")).toHaveAttribute(
      "data-slot",
      "page-header-description"
    )
    expect(screen.getByText("3 active")).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="page-header-actions"]')
    ).toContainElement(screen.getByRole("button", { name: "New project" }))
  })

  it("takes another heading level and leaves out empty parts", () => {
    render(
      <PageHeader title="Settings" titleAs="h2" titleClassName="text-xl" />
    )
    expect(
      screen.getByRole("heading", { level: 2, name: "Settings" })
    ).toHaveClass("text-xl")
    expect(
      document.querySelector('[data-slot="page-header-actions"]')
    ).not.toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="page-header-description"]')
    ).not.toBeInTheDocument()
  })
})

describe("PeriodStepper", () => {
  it("steps with buttons and announces the range", async () => {
    const user = createUser()
    const onPrevious = vi.fn()
    const onToday = vi.fn()
    const onNext = vi.fn()
    render(
      <PeriodStepper
        label="October 2026"
        stepLabel="month"
        onPrevious={onPrevious}
        onToday={onToday}
        onNext={onNext}
        className="gap-1"
      />
    )
    await user.click(screen.getByRole("button", { name: "Previous month" }))
    await user.click(screen.getByRole("button", { name: "Today" }))
    await user.click(screen.getByRole("button", { name: "Next month" }))
    expect(onPrevious).toHaveBeenCalledTimes(1)
    expect(onToday).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
    const label = screen.getByRole("heading", { name: "October 2026" })
    expect(label).toHaveAttribute("aria-live", "polite")
    expect(document.querySelector('[data-slot="period-stepper"]')).toHaveClass(
      "gap-1"
    )
  })

  it("leaves out Today when there is no handler", () => {
    render(
      <PeriodStepper
        label="Week 42"
        stepLabel="week"
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(
      screen.queryByRole("button", { name: "Today" })
    ).not.toBeInTheDocument()
  })

  it("links with Next when given hrefs", () => {
    render(
      <NextPeriodStepper
        label="Oct 12 – 18"
        stepLabel="week"
        previousHref="/tasks?week=41"
        todayHref="/tasks"
        nextHref="/tasks?week=43"
      />
    )
    expect(screen.getByRole("link", { name: "Previous week" })).toHaveAttribute(
      "href",
      "/tasks?week=41"
    )
    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute(
      "href",
      "/tasks"
    )
    expect(screen.getByRole("link", { name: "Next week" })).toHaveAttribute(
      "href",
      "/tasks?week=43"
    )
  })
})

describe("SkipLink", () => {
  it("jumps to the main content and stays hidden until focused", () => {
    render(<SkipLink href="#main" className="focus:top-2" />)
    const link = screen.getByRole("link", { name: "Skip to content" })
    expect(link).toHaveAttribute("href", "#main")
    expect(link).toHaveClass("sr-only", "focus:not-sr-only", "focus:top-2")
    expect(link).not.toHaveClass("focus:top-4")
  })

  it("defaults to #main-content and takes its own text", () => {
    render(<SkipLink>Skip navigation</SkipLink>)
    expect(
      screen.getByRole("link", { name: "Skip navigation" })
    ).toHaveAttribute("href", "#main-content")
  })
})
