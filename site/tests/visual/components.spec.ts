import { expect, test, type Page } from "@playwright/test"

/**
 * One screenshot per story and theme, cropped to the story root. Covers the
 * shared chrome (buttons, form controls, menus, tables, status colors) so a
 * token or class change that shifts the look fails here before it ships.
 */
const stories: Array<{ id: string; open?: (page: Page) => Promise<void> }> = [
  { id: "actions-button--variants" },
  { id: "data-display-badge--variants" },
  { id: "feedback-alert--tones" },
  { id: "examples-fields--trigger-alignment" },
  { id: "layout-card--full-bleed" },
  { id: "data-display-table--profile-card" },
  { id: "navigation-tabs--composition" },
  { id: "actions-toggle-group--playground" },
  { id: "actions-toggle--variants" },
  { id: "forms-switch--settings" },
  { id: "forms-radio-group--composition" },
  { id: "navigation-pagination--with-ellipsis" },
  { id: "navigation-breadcrumb--collapsed" },
  { id: "feedback-progress--labelled" },
  { id: "forms-slider--labelled" },
  { id: "data-display-meter--with-markers" },
  { id: "data-display-stat-tile--row" },
  { id: "data-display-color-legend--scale" },
  { id: "forms-search-picker--example" },
  { id: "data-display-markdown--gfm" },
  { id: "overlays-info-tip--layouts" },
  {
    id: "actions-dropdown-menu--row-actions",
    open: (page) => page.getByRole("button", { name: "Actions" }).click(),
  },
  {
    id: "layout-accordion--faq",
    open: (page) =>
      page.getByRole("button", { name: "When do exports run?" }).click(),
  },
]

for (const theme of ["light", "dark"] as const) {
  for (const story of stories) {
    test(`${story.id} (${theme})`, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`
      )
      await page.waitForSelector("body.sb-show-main")
      await page.evaluate(() => document.fonts.ready)
      await story.open?.(page)
      await page.mouse.move(0, 0)
      // Menus portal outside the story root, so capture the viewport then.
      const target = story.open ? page : page.locator("#storybook-root")
      await expect(target).toHaveScreenshot(`${story.id}-${theme}.png`)
    })
  }
}
