import { expect, test, type Page } from "@playwright/test"

/**
 * One screenshot per story and theme, cropped to the story root. Covers the
 * shared chrome (buttons, form controls, menus, tables, status colors) so a
 * token or class change that shifts the look fails here before it ships.
 */
const stories: Array<{ id: string; open?: (page: Page) => Promise<void> }> = [
  { id: "components-button--variants" },
  { id: "components-badge--variants" },
  { id: "components-alert--tones" },
  { id: "examples-fields--trigger-alignment" },
  { id: "components-card--full-bleed" },
  { id: "components-table--profile-card" },
  { id: "components-tabs--composition" },
  { id: "components-toggle-group--playground" },
  { id: "components-toggle--variants" },
  { id: "components-switch--settings" },
  { id: "components-radio-group--composition" },
  { id: "components-pagination--with-ellipsis" },
  { id: "components-breadcrumb--collapsed" },
  { id: "components-progress--labelled" },
  { id: "components-slider--labelled" },
  { id: "components-meter--with-markers" },
  { id: "components-stat-tile--row" },
  { id: "components-color-legend--scale" },
  { id: "components-search-picker--example" },
  { id: "components-markdown--gfm" },
  { id: "components-info-tip--layouts" },
  {
    id: "components-dropdown-menu--row-actions",
    open: (page) => page.getByRole("button", { name: "Actions" }).click(),
  },
  {
    id: "components-accordion--faq",
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
