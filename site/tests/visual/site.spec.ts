import { expect, test } from "@playwright/test"

import { GITHUB_URL, NPM_URL } from "../../src/lib/docs.js"
import { MANAGER_MUTED, MANAGER_MUTED_ON } from "../../src/lib/manager-theme.js"
import { openStory, THEMES } from "../browser.mjs"
import { contrastRatio, hexRgb } from "../contrast.mjs"
import { sidebarGroups } from "../sidebar-groups.mjs"

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

test("sidebar shortcut hints meet 4.5:1 in light and dark story themes", async ({
  page,
}) => {
  for (const theme of THEMES) {
    await page.goto(
      `/?path=/story/actions-button--playground&globals=theme:${theme}`
    )
    const hint = page
      .locator(".sidebar-container .search-field code")
      .or(
        page
          .locator(".sidebar-container span[aria-hidden='true']")
          .filter({ hasText: /[⌘⌃⌥⇧]|Ctrl|Cmd|Alt|Shift|\b[A-Z]\b/ })
      )
      .first()
    await expect(hint, `shortcut hint in ${theme}`).toBeVisible()
    const ratio = await hint.evaluate((element) => {
      const parse = (color: string) => {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        return match
          ? [Number(match[1]), Number(match[2]), Number(match[3])]
          : null
      }
      const color = parse(getComputedStyle(element).color)
      let node: HTMLElement | null = element
      let background: number[] | null = null
      while (node && !background) {
        const raw = getComputedStyle(node).backgroundColor
        const rgb = parse(raw)
        const alpha = /rgba\(/.test(raw)
          ? Number(raw.split(",")[3])
          : rgb
            ? 1
            : 0
        if (rgb && alpha >= 1) background = rgb
        node = node.parentElement
      }
      return { color, background }
    })
    expect(ratio.color, `shortcut color in ${theme}`).toBeTruthy()
    expect(ratio.background, `shortcut background in ${theme}`).toBeTruthy()
    expect(
      contrastRatio(ratio.color!, ratio.background!),
      `shortcut contrast in ${theme}`
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(hexRgb(MANAGER_MUTED.light), hexRgb(MANAGER_MUTED_ON.light))
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(hexRgb(MANAGER_MUTED.dark), hexRgb(MANAGER_MUTED_ON.dark))
    ).toBeGreaterThanOrEqual(4.5)
  }
})

test("the sidebar groups components by purpose", async ({ page }) => {
  await page.goto("/?path=/docs/docs-readme--docs")
  await expect(page.locator('[data-nodetype="root"]')).toHaveText(
    sidebarGroups as string[]
  )
})

test("picker guidance links between related components", async ({ page }) => {
  await page.goto("/?path=/docs/forms-combobox--docs")
  const docs = page.frameLocator("#storybook-preview-iframe")
  await docs.getByRole("link", { name: "Select", exact: true }).click()
  await expect(page).toHaveURL(/path=\/docs\/forms-select--docs/)
  await docs.getByRole("link", { name: "Combobox", exact: true }).click()
  await expect(page).toHaveURL(/path=\/docs\/forms-combobox--docs/)
  await docs.getByRole("link", { name: "SearchPicker", exact: true }).click()
  await expect(page).toHaveURL(/path=\/docs\/forms-search-picker--docs/)
})

for (const theme of THEMES) {
  test(`a field card toggles from its label and keyboard in ${theme}`, async ({
    page,
  }) => {
    await openStory(page, "", "forms-field--selectable", theme)
    const choice = page.getByRole("checkbox", {
      name: "Receive the weekly digest",
    })
    await expect(choice).toBeChecked()
    await page.getByText("Receive the weekly digest", { exact: true }).click()
    await expect(choice).not.toBeChecked()
    await choice.focus()
    await page.keyboard.press("Space")
    await expect(choice).toBeChecked()
  })
}

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
