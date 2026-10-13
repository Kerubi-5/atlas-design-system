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

test("links to the old Sonner page land on the Toast page", async ({
  page,
}) => {
  await page.goto("/?path=/story/feedback-sonner--types")
  await expect(page).toHaveURL(/path=\/story\/feedback-toast--types$/)
  await page.goto("/?path=/story/components-sonner--playground")
  await expect(page).toHaveURL(/path=\/story\/feedback-toast--playground$/)
})

test("unknown URLs show the branded not-found page with a link home", async ({
  page,
}) => {
  const response = await page.goto("/zzz-nope")
  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: /Atlas React Kit home/ })
  ).toHaveAttribute("href", "/")
})

test("unknown story and docs ids show the branded not-found page", async ({
  page,
}) => {
  for (const path of ["/story/nope--nope", "/docs/nope--docs", "/docs/nope"]) {
    await page.goto(`/?path=${path}`)
    await expect(
      page.getByRole("heading", { name: "Page not found" })
    ).toBeVisible()
    await expect(page.getByText(path)).toBeVisible()
    await expect(
      page.getByRole("link", { name: /Atlas React Kit home/ })
    ).toHaveAttribute("href", "/")
  }
  // Known pages still load in Storybook.
  await page.goto("/?path=/docs/docs-readme--docs")
  await expect(page.locator("#storybook-preview-iframe")).toBeVisible()
})
