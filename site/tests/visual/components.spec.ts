import { expect, test, type Page } from "@playwright/test"

import {
  DESKTOP,
  PHONE,
  THEMES,
  openStory,
  storyIndex,
  storyRoot,
} from "../browser.mjs"
import { OVERLAYS, openOverlay, toastVariantIds } from "../overlays.mjs"

/** Desktop captures; their baselines were taken 720px tall. */
const WIDE = { width: DESKTOP.width, height: 720 }

/**
 * Screenshots of every component page, in light and dark, plus a phone-width
 * pass for the layouts most likely to break at 390px. Overlays (the shared
 * list in tests/overlays.mjs, which axe also scans open) are opened first so
 * the menu, dialog, or list itself is compared. A token or class change that
 * shifts the look fails here before it ships, and the last test fails when a
 * component page has no screenshot.
 */
type Story = {
  id: string
  /** Opens the overlay; the screenshot then covers the whole viewport. */
  open?: (page: Page) => Promise<unknown>
}
type Overlay = {
  id: string
  shows: string
  open: (page: Page) => Promise<unknown>
}

/** Overlay stories whose component page another story already captures. */
const capturedElsewhere = new Set([
  "overlays-info-tip--playground",
  "forms-date-picker--playground",
])

const overlayStories: Story[] = (OVERLAYS as Overlay[])
  .filter((overlay) => !capturedElsewhere.has(overlay.id))
  .map((overlay) => ({
    id: overlay.id,
    open: (page) => openOverlay(page, overlay),
  }))

const stories: Story[] = [
  { id: "foundations-tokens--theme" },
  { id: "foundations-theme-provider--toolbar" },
  { id: "actions-button--variants" },
  { id: "actions-toggle--variants" },
  { id: "actions-toggle-group--playground" },
  { id: "examples-fields--trigger-alignment" },
  { id: "forms-input--invalid" },
  { id: "forms-textarea--playground" },
  { id: "forms-label--playground" },
  { id: "forms-choice-fields--form" },
  { id: "forms-field--composition" },
  { id: "forms-field--selectable" },
  { id: "forms-field--form-helpers" },
  { id: "forms-field--paired-fields" },
  { id: "forms-checkbox--composition" },
  { id: "forms-radio-group--composition" },
  { id: "forms-switch--settings" },
  { id: "forms-slider--labelled" },
  { id: "forms-search-picker--example" },
  { id: "forms-calendar--single-day" },
  { id: "forms-date-picker--range-reference" },
  { id: "forms-date-picker--narrow-range" },
  { id: "navigation-tabs--composition" },
  { id: "navigation-tabs--nav" },
  { id: "navigation-tabs--nav-narrow" },
  { id: "navigation-tabs--nav-desktop" },
  { id: "navigation-tabs--overflow" },
  { id: "navigation-nav-link--shell" },
  { id: "navigation-breadcrumb--collapsed" },
  { id: "navigation-pagination--with-ellipsis" },
  { id: "feedback-alert--tones" },
  { id: "feedback-progress--labelled" },
  { id: "feedback-spinner--in-button" },
  { id: "feedback-skeleton--loading" },
  { id: "feedback-skeleton--cards" },
  { id: "feedback-empty-panel--sizes" },
  { id: "feedback-error-boundary--fallback" },
  { id: "overlays-info-tip--layouts" },
  { id: "data-display-badge--variants" },
  { id: "data-display-avatar--sizes" },
  { id: "data-display-table--profile-card" },
  { id: "data-display-table--loading" },
  { id: "data-display-stat-tile--row" },
  { id: "data-display-meter--with-markers" },
  { id: "data-display-color-legend--scale" },
  { id: "data-display-markdown--gfm" },
  { id: "data-display-chart--spend-line" },
  { id: "data-display-kanban--board" },
  { id: "data-display-kanban--loading" },
  { id: "layout-card--full-bleed" },
  { id: "layout-separator--with-skeleton" },
  { id: "layout-page-header--with-stepper" },
  ...overlayStories,
]

/** Stories whose layout changes at phone width. */
const phoneStories = new Set([
  "data-display-kanban--board",
  "data-display-kanban--card-actions",
  "navigation-nav-link--shell",
  "examples-fields--trigger-alignment",
  "forms-date-time-picker--playground",
  "forms-date-picker--range-reference",
  "forms-date-picker--narrow-range",
  "overlays-dialog--long-title",
  "navigation-tabs--composition",
  "navigation-tabs--nav",
  "navigation-tabs--nav-desktop",
  "navigation-tabs--overflow",
  "navigation-pagination--with-ellipsis",
  "data-display-table--profile-card",
  "data-display-stat-tile--row",
  "overlays-dialog--playground",
  "feedback-toast--playground",
  ...toastVariantIds,
])

/** Settings-style tab rows compared at desktop width. */
const wideStories = new Set([
  "navigation-tabs--nav",
  "navigation-tabs--nav-desktop",
  "feedback-toast--types",
  "feedback-toast--playground",
  ...toastVariantIds,
])

async function capture(page: Page, story: Story, theme: string, name: string) {
  // "Today" markers in calendars must not move the baseline from day to day.
  await page.clock.setFixedTime(new Date("2026-01-15T12:00:00Z"))
  await openStory(page, "", story.id, theme)
  await story.open?.(page)
  if (!story.open) await page.mouse.move(0, 0)
  // Overlays portal outside the story root, so capture the viewport then.
  const target = story.open ? page : storyRoot(page)
  await expect(target).toHaveScreenshot(name)
}

for (const theme of THEMES) {
  for (const story of stories) {
    test(`${story.id} (${theme})`, async ({ page }) => {
      await capture(page, story, theme, `${story.id}-${theme}.png`)
    })
    if (phoneStories.has(story.id)) {
      test(`${story.id} (${theme}, ${PHONE.width}px)`, async ({ page }) => {
        await page.setViewportSize(PHONE)
        await capture(
          page,
          story,
          theme,
          `${story.id}-${theme}-${PHONE.width}.png`
        )
      })
    }
    if (wideStories.has(story.id)) {
      test(`${story.id} (${theme}, ${WIDE.width}px)`, async ({ page }) => {
        await page.setViewportSize(WIDE)
        await capture(
          page,
          story,
          theme,
          `${story.id}-${theme}-${WIDE.width}.png`
        )
      })
    }
  }
}

test("tab scroller content fits the box without a vertical scrollbar", async ({
  page,
}) => {
  for (const { id, width } of [
    { id: "navigation-tabs--nav", width: WIDE.width },
    { id: "navigation-tabs--nav", width: PHONE.width },
    { id: "navigation-tabs--overflow", width: PHONE.width },
  ] as const) {
    await page.setViewportSize(width === PHONE.width ? PHONE : WIDE)
    await openStory(page, "", id)
    const scrollers = storyRoot(page).locator("[data-slot=tabs-scroller]")
    await expect(scrollers.first()).toBeVisible()
    const metrics = await scrollers.evaluateAll((nodes) =>
      nodes.map((node) => {
        const el = node as HTMLElement
        const previous = el.style.overflowY
        el.style.overflowY = "auto"
        const list = el.querySelector(
          "[data-slot=tabs-list]"
        ) as HTMLElement | null
        const next = {
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          listHeight: list?.getBoundingClientRect().height ?? 0,
          listScrollHeight: list?.scrollHeight ?? 0,
          listClientHeight: list?.clientHeight ?? 0,
        }
        el.style.overflowY = previous
        return next
      })
    )
    expect(metrics.length, `${id} @ ${width}px`).toBeGreaterThan(0)
    for (const box of metrics) {
      expect(
        box.scrollHeight,
        `${id} @ ${width}px scrollHeight === clientHeight`
      ).toBe(box.clientHeight)
      expect(
        box.listHeight,
        `${id} @ ${width}px list fits the scroller content box`
      ).toBeLessThanOrEqual(box.clientHeight)
      expect(
        box.listScrollHeight,
        `${id} @ ${width}px list content fits the 28px row`
      ).toBe(box.listClientHeight)
    }
  }
})

test(`settings tabs share one horizontal padding at ${WIDE.width} and ${PHONE.width}`, async ({
  page,
}) => {
  for (const width of [WIDE.width, PHONE.width]) {
    await page.setViewportSize(width === PHONE.width ? PHONE : WIDE)
    await openStory(page, "", "navigation-tabs--nav")
    const links = storyRoot(page).locator("[data-slot=tabs-nav] a")
    await expect(links).toHaveCount(6)
    const pads = await links.evaluateAll((nodes) =>
      nodes.map((link) => {
        const style = getComputedStyle(link)
        return { left: style.paddingLeft, right: style.paddingRight }
      })
    )
    expect(pads, `${width}px should render six settings links`).toHaveLength(6)
    for (const pad of pads) {
      expect(pad.left).toBe(pads[0]?.left)
      expect(pad.right).toBe(pads[0]?.right)
      expect(pad.left).toBe(pad.right)
    }
  }
})

test("every component page has a screenshot", async () => {
  const index = (await storyIndex()) as {
    entries: Record<string, { id: string; title: string }>
  }
  const captured = new Set(stories.map((story) => story.id.split("--")[0]))
  const missing = [
    ...new Set(
      Object.values(index.entries)
        .filter((entry) => !/^(Docs|Examples)\//.test(entry.title))
        .map((entry) => entry.id.split("--")[0])
    ),
  ].filter((component) => !captured.has(component))
  expect(missing, "add a story for these to components.spec.ts").toEqual([])
})
