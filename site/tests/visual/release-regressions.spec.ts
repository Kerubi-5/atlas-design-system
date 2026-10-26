import { expect, test } from "@playwright/test"
import {
  PHONE,
  THEMES,
  openStory,
  settle,
  storyRoot,
  storyUrl,
} from "../browser.mjs"

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
  expect(response.headers()["x-content-type-options"]).toBe("nosniff")
  expect(response.headers()["permissions-policy"]).toContain("camera=()")
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
      // Ten pages with no ellipsis do not fit: Previous, 5 and Next stay.
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
  test(`pagination drops pages only when they do not fit ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    // Previous, 1, 2 (current), 3, …, Next: six 40px items.
    await openStory(page, "", "navigation-pagination--with-ellipsis", theme)
    const nav = storyRoot(page).locator('[data-slot="pagination"]')
    const visible = async (navWidth: number) => {
      await nav.evaluate((e, w) => (e.style.width = `${w}px`), navWidth)
      const items = await nav
        .locator('[data-slot="pagination-content"] > li')
        .evaluateAll((lis) =>
          lis
            .filter((li) => getComputedStyle(li).display !== "none")
            .map((li) =>
              li.querySelector('[data-slot="pagination-ellipsis"]')
                ? "…"
                : (li.querySelector("a")?.getAttribute("aria-label") ??
                  li.textContent!.trim())
            )
        )
      const list = (await nav
        .locator('[data-slot="pagination-content"]')
        .boundingBox())!
      expect(list.height, `${navWidth}px stays one row`).toBeLessThan(48)
      expect(list.width, `${navWidth}px fits`).toBeLessThanOrEqual(navWidth)
      return items
    }
    const previous = "Go to previous page"
    const next = "Go to next page"
    expect(await visible(300)).toEqual([previous, "1", "2", "3", "…", next])
    expect(await visible(240)).toEqual([previous, "1", "2", "3", "…", next])
    // First page, current page and the ellipsis still fit.
    expect(await visible(220)).toEqual([previous, "1", "2", "…", next])
    // They do not: Previous, the current page and Next.
    expect(await visible(190)).toEqual([previous, "2", next])
  })
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
  test(`toast floats in the viewport and uses square kit controls ${theme}`, async ({
    page,
  }) => {
    await openStory(page, "", "feedback-toast--plain", theme)
    const toast = page.locator("[data-sonner-toast]")
    await expect(toast).toBeVisible()
    // Tall page content before the toaster must not push toasts off-screen.
    await page.evaluate(() => {
      const tall = document.createElement("div")
      tall.style.height = "3000px"
      document.querySelector("#storybook-root")!.prepend(tall)
      scrollTo(0, 0)
    })
    expect(
      await page
        .locator("[data-sonner-toaster]")
        .evaluate((e) => getComputedStyle(e).position)
    ).toBe("fixed")
    for (const scroll of [0, 3000]) {
      await page.evaluate((y) => scrollTo(0, y), scroll)
      const box = (await toast.boundingBox())!
      const view = page.viewportSize()!
      expect(box.y).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height).toBeLessThanOrEqual(view.height)
      // The story mounts `position="bottom-right"`.
      expect(box.y + box.height).toBeGreaterThan(view.height - 80)
      expect(box.x + box.width).toBeGreaterThan(view.width - 80)
      expect(box.x + box.width).toBeLessThanOrEqual(view.width)
    }
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
    const toasterBox = (await page
      .locator("[data-sonner-toaster]")
      .boundingBox())!
    expect(toasterBox.x).toBeGreaterThanOrEqual(0)
    expect(toasterBox.x + toasterBox.width).toBeLessThanOrEqual(
      page.viewportSize()!.width
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
  test(`toaster list stays inside a 390px viewport ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize(PHONE)
    await openStory(page, "", "feedback-toast--long-text", theme)
    await expect(page.locator("[data-sonner-toast]")).toBeVisible()
    // The list itself is often `visibility: hidden` in Sonner; measure the box.
    const box = await page.locator("[data-sonner-toaster]").evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return { x: rect.x, right: rect.right }
    })
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.right).toBeLessThanOrEqual(PHONE.width)
  })
  test(`disabled buttons look disabled in every variant ${theme}`, async ({
    page,
  }) => {
    for (const variant of ["default", "outline", "secondary", "ghost"]) {
      const look = async (disabled: boolean) => {
        await openStory(page, "", "actions-button--playground", theme, {
          args: `variant:${variant};disabled:!${disabled}`,
        })
        const button = storyRoot(page).getByRole("button")
        const style = () =>
          button.evaluate((e) => {
            const s = getComputedStyle(e)
            return {
              opacity: s.opacity,
              filter: s.filter,
              pointerEvents: s.pointerEvents,
              background: s.backgroundColor,
              color: s.color,
              border: s.borderColor,
            }
          })
        await page.mouse.move(0, 0)
        const before = await style()
        await button.hover({ force: true })
        await page.waitForTimeout(200)
        return { before, hovered: await style() }
      }
      const enabled = await look(false)
      const disabled = await look(true)
      expect(disabled.before.opacity, variant).toBe("0.5")
      expect(disabled.before.pointerEvents, variant).toBe("none")
      // Hovering changes nothing, so it never reads as clickable.
      expect(disabled.hovered, variant).toEqual(disabled.before)
      // Same paint as enabled at half opacity: never more prominent.
      expect(enabled.before.opacity, variant).toBe("1")
      expect(disabled.before.filter, variant).toBe("none")
      expect(disabled.before.background, variant).toBe(
        enabled.before.background
      )
    }
  })
  test(`solid focus rings stay inside narrow scrolling controls ${theme}`, async ({
    page,
  }) => {
    // Where the focused element's 2px ring + 2px offset lands against every
    // clipping ancestor; a negative side is clipped. Kanban rings the grip
    // or the body, so measure the focused stop.
    const ringClearance = () =>
      page.evaluate(() => {
        const focused = document.activeElement as HTMLElement
        const ring = focused.getBoundingClientRect()
        const style = getComputedStyle(focused)
        const sides = { left: Infinity, right: Infinity, top: Infinity }
        for (
          let parent = focused.parentElement;
          parent;
          parent = parent.parentElement
        ) {
          const overflow = getComputedStyle(parent)
          if (
            overflow.overflowX === "visible" &&
            overflow.overflowY === "visible"
          )
            continue
          const box = parent.getBoundingClientRect()
          sides.left = Math.min(sides.left, ring.left - 4 - box.left)
          sides.right = Math.min(sides.right, box.right - ring.right - 4)
          sides.top = Math.min(sides.top, ring.top - 4 - box.top)
        }
        sides.left = Math.min(sides.left, ring.left - 4)
        sides.right = Math.min(sides.right, innerWidth - ring.right - 4)
        return {
          slot: focused.dataset.slot ?? focused.tagName,
          text: focused.textContent?.trim() ?? "",
          sides,
          shadow: style.boxShadow,
          offset: style.getPropertyValue("--tw-ring-offset-width").trim(),
          ringColor:
            style.getPropertyValue("--tw-ring-color").trim() ===
            style.getPropertyValue("--ring").trim(),
        }
      })
    for (const [id, width, slots, minimum] of [
      ["overlays-info-tip--layouts", 390, ["info-tip-trigger"], 1],
      ["forms-calendar--single-day", 390, ["BUTTON"], 1],
      ["forms-input--invalid", 390, ["INPUT", "input"], 1],
      ["data-display-chart--spend-line", 390, ["SVG"], 1],
      ["navigation-tabs--nav", 390, ["tabs-nav-link"], 6],
      ["navigation-tabs--nav", 768, ["tabs-nav-link"], 6],
      [
        "data-display-kanban--board",
        390,
        ["kanban-card-handle", "kanban-card-body"],
        4,
      ],
    ] as const) {
      await page.setViewportSize({ width, height: 844 })
      await openStory(page, "", id, theme)
      const seen: string[] = []
      // Tab like a user: no scripted focus or scrolling.
      for (let press = 0; press < 40; press++) {
        await page.keyboard.press("Tab")
        const ring = await ringClearance()
        if (
          !(slots as readonly string[]).includes(ring.slot.toUpperCase()) &&
          !(slots as readonly string[]).includes(ring.slot)
        )
          continue
        seen.push(ring.text)
        await expect
          .poll(async () => (await ringClearance()).shadow, { message: id })
          .toContain("4px")
        const settled = await ringClearance()
        expect(settled.offset, id).toBe("2px")
        expect(settled.ringColor, id).toBe(true)
        expect(
          settled.sides.left,
          `${id} ${width} ${ring.text}`
        ).toBeGreaterThanOrEqual(0)
        expect(
          settled.sides.right,
          `${id} ${width} ${ring.text}`
        ).toBeGreaterThanOrEqual(0)
        expect(
          settled.sides.top,
          `${id} ${width} ${ring.text}`
        ).toBeGreaterThanOrEqual(0)
      }
      expect(seen.length, `${id} ${width} focus stops`).toBeGreaterThanOrEqual(
        minimum
      )
      if (id.startsWith("navigation-tabs")) {
        const last = await page
          .locator('[data-slot="tabs-nav-link"]')
          .last()
          .evaluate((e) => e.textContent ?? "")
        expect(seen, `${id} ${width} reaches the last tab`).toContain(
          last.trim()
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
