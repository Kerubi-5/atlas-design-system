import { expect, test } from "@playwright/test"

import { GITHUB_URL, NPM_URL } from "../../src/lib/docs.js"

// Loads the Storybook UI itself (the screenshots only load the preview
// iframe), so a manager addon that throws fails here.
test("the toolbar links to GitHub and npm", async ({ page }) => {
  await page.goto("/?path=/story/actions-button--variants")
  await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    GITHUB_URL
  )
  await expect(page.getByRole("link", { name: "npm" })).toHaveAttribute(
    "href",
    NPM_URL
  )
})

test("the README page links to GitHub and npm", async ({ page }) => {
  await page.goto("/?path=/docs/docs-readme--docs")
  const docs = page.frameLocator("#storybook-preview-iframe")
  await expect(
    docs.getByRole("link", { name: "GitHub", exact: true })
  ).toHaveAttribute("href", GITHUB_URL)
  await expect(
    docs.getByRole("link", { name: "npm", exact: true })
  ).toHaveAttribute("href", NPM_URL)
})

test("the sidebar groups components by purpose", async ({ page }) => {
  await page.goto("/?path=/docs/docs-readme--docs")
  await expect(page.locator('[data-nodetype="root"]')).toHaveText([
    "Docs",
    "Foundations",
    "Actions",
    "Forms",
    "Navigation",
    "Feedback",
    "Overlays",
    "Data display",
    "Layout",
    "Examples",
  ])
})

test("links to a page's old Components/ id land on its new page", async ({
  page,
}) => {
  await page.goto("/?path=/story/components-button--variants")
  await expect(page).toHaveURL(/path=\/story\/actions-button--variants$/)
  await page.goto("/?path=/docs/components-date-picker--docs")
  await expect(page).toHaveURL(/path=\/docs\/forms-date-picker--docs$/)
  await page.goto("/?path=/story/tokens--theme")
  await expect(page).toHaveURL(/path=\/story\/foundations-tokens--theme$/)
})
