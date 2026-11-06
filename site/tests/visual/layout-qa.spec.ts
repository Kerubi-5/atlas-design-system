import { expect, test } from "@playwright/test"

import { PHONE, THEMES, openStory, storyRoot } from "../browser.mjs"

test("PageHeader keeps actions beside a long title from sm up", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 700 })
  await openStory(page, "", "layout-page-header--long-title")
  const title = storyRoot(page).getByRole("heading", {
    name: "North Harbor Coffee Roasters enterprise discovery",
  })
  const actions = storyRoot(page).locator("[data-slot=page-header-actions]")
  const titleBox = (await title.boundingBox())!
  const actionsBox = (await actions.boundingBox())!
  expect(actionsBox.x).toBeGreaterThan(titleBox.x)
  expect(actionsBox.y).toBeLessThan(titleBox.y + titleBox.height)
  expect(actionsBox.y + actionsBox.height).toBeGreaterThan(titleBox.y)

  await page.setViewportSize(PHONE)
  await openStory(page, "", "layout-page-header--long-title")
  const stackedTitle = (await title.boundingBox())!
  const stackedActions = (await actions.boundingBox())!
  expect(stackedActions.y).toBeGreaterThan(
    stackedTitle.y + stackedTitle.height - 1
  )
})

for (const theme of THEMES) {
  test(`Slider track uses the muted fill, not input, ${theme}`, async ({
    page,
  }) => {
    await openStory(page, "", "forms-slider--labelled", theme)
    const colors = await storyRoot(page).evaluate(() => {
      const track = document.querySelector("[data-slot=slider-track]")
      if (!track) return null
      const probe = document.createElement("div")
      document.body.append(probe)
      probe.style.backgroundColor = "var(--muted)"
      const muted = getComputedStyle(probe).backgroundColor
      probe.style.backgroundColor = "var(--input)"
      const input = getComputedStyle(probe).backgroundColor
      probe.remove()
      return {
        fill: getComputedStyle(track).backgroundColor,
        muted,
        input,
      }
    })
    expect(colors).toBeTruthy()
    expect(colors!.fill).toBe(colors!.muted)
    expect(colors!.fill).not.toBe(colors!.input)
  })

  test(`KanbanSkeleton cards match loaded card size and stay light gray ${theme}`, async ({
    page,
  }) => {
    await openStory(page, "", "data-display-kanban--board", theme)
    const live = (await storyRoot(page)
      .locator("[data-slot=kanban-card]")
      .first()
      .boundingBox())!
    await openStory(page, "", "data-display-kanban--loading", theme)
    const placeholder = storyRoot(page)
      .locator("[data-slot=kanban-card-skeleton]")
      .first()
    const skeleton = (await placeholder.boundingBox())!
    expect(Math.abs(skeleton.height - live.height)).toBeLessThan(8)
    expect(skeleton.width).toBeGreaterThan(live.width * 0.5)
    const fills = await storyRoot(page).evaluate(() => {
      const bar = document.querySelector(
        "[data-slot=kanban-card-skeleton] [data-slot=skeleton]"
      )
      const column = document.querySelector(
        "[data-slot=kanban-skeleton] [data-slot=kanban-column]"
      )
      if (!bar || !column) return null
      const probe = document.createElement("div")
      document.body.append(probe)
      probe.style.backgroundColor = "var(--skeleton)"
      const token = getComputedStyle(probe).backgroundColor
      probe.style.backgroundColor = "var(--input)"
      const input = getComputedStyle(probe).backgroundColor
      probe.remove()
      return {
        bar: getComputedStyle(bar).backgroundColor,
        column: getComputedStyle(column).backgroundColor,
        token,
        input,
      }
    })
    expect(fills).toBeTruthy()
    expect(fills!.bar).toBe(fills!.token)
    expect(fills!.bar).not.toBe(fills!.input)
    expect(fills!.column).not.toBe(fills!.token)
  })
}

test("five Kanban columns fit a 900px board and still scroll when narrower", async ({
  page,
}) => {
  await page.setViewportSize({ width: 960, height: 700 })
  await openStory(page, "", "data-display-kanban--five-columns")
  const scroller = storyRoot(page).locator("[data-slot=kanban-scroller]")
  await expect(scroller).toBeVisible()
  await scroller.evaluate((element) => {
    element.style.width = "900px"
  })
  const atNineHundred = await scroller.evaluate((element) => ({
    scroll: element.scrollWidth,
    client: element.clientWidth,
    columns: element.querySelectorAll("[data-slot=kanban-column]").length,
  }))
  expect(atNineHundred.columns).toBe(5)
  expect(atNineHundred.scroll).toBeLessThanOrEqual(atNineHundred.client + 1)

  await scroller.evaluate((element) => {
    element.style.width = "640px"
  })
  const atNarrow = await scroller.evaluate((element) => ({
    scroll: element.scrollWidth,
    client: element.clientWidth,
  }))
  expect(atNarrow.scroll).toBeGreaterThan(atNarrow.client)
})

test("Card leaves a flush hour label visible and still clips a banner image", async ({
  page,
}) => {
  await openStory(page, "", "layout-card--flush-edge")
  const label = storyRoot(page).locator("[data-slot=calendar-hour-label]")
  const labelCard = storyRoot(page).locator("[data-slot=card]").first()
  const imageCard = storyRoot(page).locator("[data-slot=card]").nth(1)
  await expect(label).toBeVisible()
  const clip = await label.evaluate((element) => {
    const card = element.closest("[data-slot=card]") as HTMLElement
    const box = element.getBoundingClientRect()
    const parent = card.getBoundingClientRect()
    const style = getComputedStyle(card)
    return {
      overflow: style.overflow,
      overflowY: style.overflowY,
      height: box.height,
      labelBottom: box.bottom,
      cardBottom: parent.bottom,
    }
  })
  expect(clip.overflowY).toBe("visible")
  expect(clip.height).toBeGreaterThan(8)
  expect(clip.labelBottom).toBeLessThanOrEqual(clip.cardBottom + 1)
  const imageOverflow = await imageCard.evaluate(
    (element) => getComputedStyle(element).overflow
  )
  expect(imageOverflow).toBe("hidden")
  const labelOverflow = await labelCard.evaluate(
    (element) => getComputedStyle(element).overflow
  )
  expect(labelOverflow).toBe("visible")
})

test("Table body rows share the same bottom border", async ({ page }) => {
  await openStory(page, "", "data-display-table--profile-card")
  const borders = await storyRoot(page).evaluate(() => {
    const rows = [
      ...document.querySelectorAll(
        "[data-slot=table-body] [data-slot=table-row]"
      ),
    ]
    return rows.map((row) => getComputedStyle(row).borderBottomWidth)
  })
  expect(borders.length).toBeGreaterThan(1)
  expect(new Set(borders).size).toBe(1)
  expect(borders[0]).not.toBe("0px")
})
