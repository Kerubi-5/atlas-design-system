import { expect, test } from "@playwright/test"

import { PHONE, THEMES, WIDTHS, openStory } from "../browser.mjs"

for (const width of WIDTHS) {
  for (const theme of THEMES) {
    test(`picker values and dialog titles fit at ${width} ${theme}`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: PHONE.height })
      const story = (id: string, args?: string) =>
        openStory(page, "", id, theme, { args })
      await story("forms-date-picker--narrow-range")
      const trigger = page
        .locator("[data-slot=date-picker-value]")
        .locator("..")
      await expect(trigger).toHaveAccessibleName(
        "October 5th, 2026 – October 20th, 2026"
      )
      const range = await trigger.evaluate((element) => ({
        width: element.clientWidth,
        contentWidth: element.scrollWidth,
        height: element.getBoundingClientRect().height,
      }))
      expect(range.contentWidth).toBeLessThanOrEqual(range.width)
      expect(range.height).toBeGreaterThan(40)
      await page.screenshot({ path: info.outputPath("readable-range.png") })
      await trigger.click()
      await expect(page.getByRole("dialog")).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(trigger).toBeFocused()

      await story("examples-fields--trigger-alignment")
      for (const value of await page
        .locator("[data-slot=date-picker-value]")
        .all()) {
        expect((await value.locator("..").boundingBox())?.height).toBe(40)
      }
      const inset = await page.getByLabel("Plain input").boundingBox()
      expect(inset?.x).toBe(width === PHONE.width ? 16 : 24)

      await story("forms-date-picker--compact")
      const compact = page
        .locator("[data-slot=date-picker-value]")
        .locator("..")
      expect((await compact.boundingBox())?.height).toBe(32)

      await story("overlays-dialog--long-title")
      await page.getByRole("button", { name: "Open dialog" }).click()
      const close = page.getByRole("button", { name: "Close", exact: true })
      const title = page.getByRole("heading", {
        name: "Review quarterly accounts",
      })
      const titleBox = await title.evaluate((element) => {
        const range = document.createRange()
        range.selectNodeContents(element)
        return [...range.getClientRects()].map((rect) => ({
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        }))
      })
      const closeBox = (await close.boundingBox())!
      for (const line of titleBox.filter(
        (line) =>
          line.top < closeBox.y + closeBox.height && line.bottom > closeBox.y
      )) {
        expect(line.right).toBeLessThanOrEqual(closeBox.x)
      }
      await page.screenshot({ path: info.outputPath("dialog-title.png") })
      await close.click()
      await expect(
        page.getByRole("button", { name: "Open dialog" })
      ).toBeFocused()

      await story("overlays-dialog--long-title", "showCloseButton:false")
      await page.getByRole("button", { name: "Open dialog" }).click()
      await expect(close).toHaveCount(0)
      expect(
        await title.evaluate(
          (element) => getComputedStyle(element).paddingRight
        )
      ).toBe("0px")
      await page.keyboard.press("Escape")
      await expect(
        page.getByRole("button", { name: "Open dialog" })
      ).toBeFocused()
    })
  }
}

test("Start here links open existing components and examples", async ({
  page,
}) => {
  await page.goto("/")
  await expect(page).toHaveURL(/path=\/docs\/docs-start-here--docs/)
  const docs = page.frameLocator("#storybook-preview-iframe")
  await expect(
    docs.getByRole("heading", { name: "Find what you need" })
  ).toBeVisible()
  await docs.getByRole("link", { name: "Combobox", exact: true }).click()
  await expect(page).toHaveURL(/path=\/docs\/forms-combobox--docs/)
  await page.goto("/?path=/docs/docs-start-here--docs")
  await docs.getByRole("link", { name: "form examples", exact: true }).click()
  await expect(page).toHaveURL(/path=\/docs\/examples-fields--docs/)
})
