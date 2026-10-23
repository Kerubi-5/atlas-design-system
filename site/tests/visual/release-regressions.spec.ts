import { expect, test } from "@playwright/test"
import { THEMES, openStory, settle, storyRoot, storyUrl } from "../browser.mjs"
import { contrastRatio } from "../contrast.mjs"

test("docs serve security headers and their preview favicon", async ({
  page,
  request,
}) => {
  const response = await request.get("/iframe.html")
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'self'"
  )
  expect(response.headers()["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin"
  )
  await openStory(page, "", "data-display-stat-tile--row")
  const icon = await page.locator('link[rel="icon"]').getAttribute("href")
  expect(icon).toBeTruthy()
  expect((await request.get(new URL(icon!, page.url()).href)).ok()).toBe(true)
})

for (const theme of THEMES) {
  test(`Calendar and StatTile docs fit at 340px ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 340, height: 844 })
    for (const id of ["forms-calendar--docs", "data-display-stat-tile--docs"]) {
      await page.goto(storyUrl(id, { theme, viewMode: "docs" }))
      await expect(page.locator(".sbdocs-content")).toBeVisible()
      await settle(page)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(340)
      if (id.startsWith("forms")) {
        for (const calendar of await page
          .locator('[data-slot="calendar"]')
          .all()) {
          const bounds = (await calendar.boundingBox())!
          expect(bounds.x).toBeGreaterThanOrEqual(0)
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(340)
        }
      } else {
        const overflowingCode = await page
          .locator(".sbdocs-content p code")
          .evaluateAll((elements) =>
            elements
              .filter((element) => {
                const range = document.createRange()
                range.selectNodeContents(element)
                return [...range.getClientRects()].some(
                  (rect) => rect.right > innerWidth || rect.left < 0
                )
              })
              .map((element) => element.textContent)
          )
        expect(overflowingCode).toEqual([])
      }
    }
  })
  for (const width of [340, 390]) {
    test(`pagination and calendars fit ${width}px ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 })
      await openStory(page, "", "navigation-pagination--playground", theme, {
        args: "pageCount:10;page:5",
      })
      const pages = page.locator('[data-slot="pagination-link"]:visible')
      expect(await pages.count()).toBeLessThan(12)
      await expect(page.locator('[aria-current="page"]')).toHaveText("5")
      await page.getByRole("link", { name: "Go to next page" }).click()
      await expect(page.locator('[aria-current="page"]')).toHaveText("6")
      await page.getByRole("link", { name: "Go to previous page" }).click()
      await expect(page.locator('[aria-current="page"]')).toHaveText("5")
      for (const id of [
        "navigation-pagination--with-ellipsis",
        "forms-calendar--single-day",
      ]) {
        await openStory(page, "", id, theme)
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(width)
        const bounds = await storyRoot(page)
          .locator(
            id.startsWith("forms")
              ? '[data-slot="calendar"]'
              : '[data-slot="pagination"]'
          )
          .boundingBox()
        expect(bounds!.x).toBeGreaterThanOrEqual(0)
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
      }
    })
  }
  test(`field errors stay beside their field and separate from form feedback ${theme}`, async ({
    page,
  }) => {
    await openStory(page, "", "forms-field--form-helpers", theme)
    const input = page.getByRole("textbox", { name: "Name" })
    const error = page.getByText("This name is already taken.")
    await expect(input).toHaveAttribute("aria-invalid", "true")
    const described = await input.getAttribute("aria-describedby")
    expect(described?.split(" ")).toContain(await error.getAttribute("id"))
    expect((await error.boundingBox())!.y).toBeGreaterThan(
      (await input.boundingBox())!.y
    )
    const feedback = page.locator('[data-slot="form-feedback"]')
    expect((await feedback.boundingBox())!.y).toBeGreaterThan(
      (await page.getByText("Starts", { exact: true }).boundingBox())!.y
    )
    expect(await error.evaluate((e) => getComputedStyle(e).fontSize)).toBe(
      await feedback.evaluate((e) => getComputedStyle(e).fontSize)
    )
  })
  test(`toast takes its own space and uses square kit controls ${theme}`, async ({
    page,
  }) => {
    await openStory(page, "", "feedback-toast--plain", theme)
    const toast = page.locator("[data-sonner-toast]")
    await expect(toast).toBeVisible()
    expect(await toast.evaluate((e) => getComputedStyle(e).position)).toBe(
      "relative"
    )
    expect(
      await toast
        .locator("[data-close-button]")
        .evaluate((e) => getComputedStyle(e).borderRadius)
    ).toBe("0px")
    expect(
      await page
        .locator("[data-sonner-toaster]")
        .evaluate((e) => getComputedStyle(e).fontFamily)
    ).toContain("IBM Plex Sans")
    const region = page.locator('[data-slot="toaster"]')
    expect((await region.boundingBox())!.height).toBeGreaterThanOrEqual(
      (await toast.boundingBox())!.height
    )
    await page.keyboard.press("Tab")
    await toast.focus()
    await expect
      .poll(() => toast.evaluate((e) => getComputedStyle(e).boxShadow))
      .toContain("4px")
    await openStory(page, "", "feedback-toast--queued", theme)
    await expect(page.locator("[data-sonner-toast]:visible")).toHaveCount(3)
    await expect(
      page.locator('[data-sonner-toast][data-visible="false"]')
    ).toBeHidden()
    await page
      .locator('[data-sonner-toast][data-front="true"] [data-close-button]')
      .click()
    await expect(page.getByText("Export 1 scheduled")).toBeVisible()
    await expect(page.locator("[data-sonner-toast]:visible")).toHaveCount(3)
  })
  test(`disabled Saving button keeps readable text ${theme}`, async ({
    page,
  }) => {
    await openStory(page, "", "feedback-spinner--in-button", theme)
    const saving = page.getByRole("button", { name: /Saving/ })
    await expect(saving).toBeDisabled()
    const contrast = await saving.evaluate((element) => {
      const style = getComputedStyle(element)
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 1
      const context = canvas.getContext("2d")!
      const paint = (color: string) => {
        context.clearRect(0, 0, 1, 1)
        context.filter = style.filter
        context.fillStyle = color
        context.fillRect(0, 0, 1, 1)
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3)
      }
      return {
        foreground: paint(style.color),
        background: paint(style.backgroundColor),
        opacity: style.opacity,
      }
    })
    expect(contrast.opacity).toBe("1")
    expect(
      contrastRatio(contrast.foreground, contrast.background)
    ).toBeGreaterThanOrEqual(4.5)
  })
  test(`solid focus rings stay inside narrow scrolling controls ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    for (const [id, selector, wrapper] of [
      ["overlays-info-tip--layouts", '[data-slot="info-tip-trigger"]', null],
      ["forms-calendar--single-day", ".rdp-button_next", null],
      ["forms-input--invalid", "input", null],
      ["data-display-chart--spend-line", 'svg[tabindex="0"]', null],
      [
        "navigation-tabs--nav",
        '[data-slot="tabs-nav-link"]:last-of-type',
        '[data-slot="tabs-scroller"]',
      ],
      [
        "data-display-kanban--board",
        '[data-slot="kanban-card"] button',
        '[data-slot="kanban-card"]',
      ],
    ] as const) {
      await openStory(page, "", id, theme)
      const control = page.locator(selector).first()
      await page.keyboard.press("Tab")
      await control.focus()
      await control.scrollIntoViewIfNeeded()
      const ring = wrapper?.includes("kanban")
        ? page.locator(wrapper).first()
        : control
      await expect
        .poll(() => ring.evaluate((e) => getComputedStyle(e).boxShadow))
        .toContain("4px")
      expect(
        await ring.evaluate((e) =>
          getComputedStyle(e).getPropertyValue("--tw-ring-offset-width").trim()
        )
      ).toBe("2px")
      expect(
        await ring.evaluate((element) => {
          const style = getComputedStyle(element)
          return (
            style.getPropertyValue("--tw-ring-color").trim() ===
            style.getPropertyValue("--ring").trim()
          )
        })
      ).toBe(true)
      const box = (await ring.boundingBox())!
      expect(box.x - 4).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width + 4).toBeLessThanOrEqual(390)
      if (wrapper?.includes("tabs")) {
        const scroller = (await page.locator(wrapper).boundingBox())!
        expect(box.x + box.width + 4).toBeLessThanOrEqual(
          scroller.x + scroller.width
        )
      }
    }
    await openStory(page, "", "forms-combobox--playground", theme)
    await page.getByRole("combobox").click()
    const search = page.locator('[data-slot="combobox-search"] input')
    await expect(search).toBeFocused()
    expect(await search.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe(
      "none"
    )
    expect(
      await search.locator("..").evaluate((e) => getComputedStyle(e).boxShadow)
    ).toBe("none")
  })
}
