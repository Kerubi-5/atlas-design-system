import fs from "node:fs"
import { fileURLToPath } from "node:url"

import { expect, test, type Page } from "@playwright/test"

/**
 * Screenshots of every component page, in light and dark, plus a phone-width
 * pass for the layouts most likely to break at 390px. Overlays are opened
 * first so the menu, dialog, or list itself is compared. A token or class
 * change that shifts the look fails here before it ships, and the last test
 * fails when a component page has no screenshot.
 */
type Story = {
  id: string
  /** Opens the overlay; the screenshot then covers the whole viewport. */
  open?: (page: Page) => Promise<unknown>
}

const root = (page: Page) => page.locator("#storybook-root")
const clickFirst =
  (role: "button" | "combobox", shows: string) => async (page: Page) => {
    await root(page).getByRole(role).first().click()
    await expect(page.getByRole(shows as "dialog").first()).toBeVisible()
  }

const stories: Story[] = [
  { id: "foundations-tokens--theme" },
  { id: "foundations-theme-provider--toolbar" },
  { id: "actions-button--variants" },
  { id: "actions-toggle--variants" },
  { id: "actions-toggle-group--playground" },
  {
    id: "actions-dropdown-menu--row-actions",
    open: (page) => page.getByRole("button", { name: "Actions" }).click(),
  },
  { id: "examples-fields--trigger-alignment" },
  { id: "forms-input--invalid" },
  { id: "forms-textarea--playground" },
  { id: "forms-label--playground" },
  { id: "forms-field--composition" },
  { id: "forms-checkbox--composition" },
  { id: "forms-radio-group--composition" },
  { id: "forms-switch--settings" },
  { id: "forms-slider--labelled" },
  { id: "forms-select--playground", open: clickFirst("combobox", "listbox") },
  { id: "forms-combobox--playground", open: clickFirst("combobox", "listbox") },
  { id: "forms-search-picker--example" },
  { id: "forms-calendar--single-day" },
  { id: "forms-date-picker--range-reference" },
  {
    id: "forms-date-time-picker--playground",
    open: clickFirst("button", "dialog"),
  },
  { id: "navigation-tabs--composition" },
  { id: "navigation-breadcrumb--collapsed" },
  { id: "navigation-pagination--with-ellipsis" },
  { id: "feedback-alert--tones" },
  { id: "feedback-progress--labelled" },
  { id: "feedback-spinner--in-button" },
  { id: "feedback-skeleton--loading" },
  { id: "feedback-empty-panel--sizes" },
  { id: "feedback-error-boundary--fallback" },
  { id: "feedback-sonner--types" },
  {
    id: "feedback-sonner--playground",
    open: async (page) => {
      await root(page).getByRole("button").first().click()
      await expect(page.locator("[data-sonner-toast]").first()).toBeVisible()
    },
  },
  { id: "overlays-dialog--playground", open: clickFirst("button", "dialog") },
  { id: "overlays-popover--playground", open: clickFirst("button", "dialog") },
  {
    id: "overlays-tooltip--playground",
    open: async (page) => {
      await root(page).getByRole("button").first().focus()
      await expect(page.getByRole("tooltip")).toBeVisible()
    },
  },
  { id: "overlays-info-tip--layouts" },
  { id: "data-display-badge--variants" },
  { id: "data-display-avatar--sizes" },
  { id: "data-display-table--profile-card" },
  { id: "data-display-stat-tile--row" },
  { id: "data-display-meter--with-markers" },
  { id: "data-display-color-legend--scale" },
  { id: "data-display-markdown--gfm" },
  { id: "layout-card--full-bleed" },
  { id: "layout-separator--with-skeleton" },
  {
    id: "layout-accordion--faq",
    open: (page) =>
      page.getByRole("button", { name: "When do exports run?" }).click(),
  },
]

/** Stories whose layout changes at phone width. */
const phoneStories = new Set([
  "examples-fields--trigger-alignment",
  "forms-date-time-picker--playground",
  "navigation-tabs--composition",
  "navigation-pagination--with-ellipsis",
  "data-display-table--profile-card",
  "data-display-stat-tile--row",
  "overlays-dialog--playground",
])

async function capture(page: Page, story: Story, theme: string, name: string) {
  // "Today" markers in calendars must not move the baseline from day to day.
  await page.clock.setFixedTime(new Date("2026-01-15T12:00:00Z"))
  await page.goto(
    `/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`
  )
  await page.waitForSelector("body.sb-show-main")
  await page.evaluate(() => document.fonts.ready)
  await story.open?.(page)
  if (!story.open) await page.mouse.move(0, 0)
  // Overlays portal outside the story root, so capture the viewport then.
  const target = story.open ? page : root(page)
  await expect(target).toHaveScreenshot(name)
}

for (const theme of ["light", "dark"] as const) {
  for (const story of stories) {
    test(`${story.id} (${theme})`, async ({ page }) => {
      await capture(page, story, theme, `${story.id}-${theme}.png`)
    })
    if (phoneStories.has(story.id)) {
      test(`${story.id} (${theme}, 390px)`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await capture(page, story, theme, `${story.id}-${theme}-390.png`)
      })
    }
  }
}

test("every component page has a screenshot", () => {
  const index = JSON.parse(
    fs.readFileSync(
      fileURLToPath(new URL("../../dist/index.json", import.meta.url)),
      "utf8"
    )
  ) as { entries: Record<string, { id: string; title: string }> }
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
