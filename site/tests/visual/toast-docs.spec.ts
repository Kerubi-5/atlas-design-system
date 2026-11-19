import { expect, test } from "@playwright/test"

import { DESKTOP, PHONE, WIDTHS, settle, storyUrl } from "../browser.mjs"

for (const width of WIDTHS) {
  test(`Toast docs shows no toast until the trigger is clicked at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width,
      height: width === PHONE.width ? PHONE.height : DESKTOP.height,
    })
    await page.goto(storyUrl("feedback-toast--docs", { viewMode: "docs" }))
    await expect(page.locator(".sbdocs-content")).toBeVisible()
    await settle(page)
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(0)
    await page.getByRole("button", { name: "Show toast" }).first().click()
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1)
    await expect(page.locator("[data-sonner-toast]")).toBeVisible()
  })
}
