// Docs-page gate: every autodocs and MDX page, in light and dark, at 1280
// and 390, must pass axe-core's WCAG 2.2 A and AA rules, follow the theme
// toolbar, and never scroll sideways (wide tables and code scroll inside
// their own focusable container instead). Run after `npm run build` with
// `npm run test:a11y`.
import assert from "node:assert/strict"
import test from "node:test"

import {
  DESKTOP,
  PHONE,
  THEMES,
  WIDTHS,
  assertNoProblems,
  inBatches,
  indexEntries,
  openStory,
  runAxe,
  settle,
  storyUrl,
  violationMessage,
  withSite,
} from "./browser.mjs"

async function auditDocs(context, baseUrl, entry, theme, width) {
  const label = `${entry.id} [${theme}, ${width}px]`
  const page = await context.newPage()
  try {
    await page.setViewportSize({ width, height: DESKTOP.height })
    await page.goto(
      `${baseUrl}${storyUrl(entry.id, { theme, viewMode: "docs" })}`
    )
    await page.waitForSelector(".sbdocs-content", { timeout: 20_000 })
    await settle(page)

    const problems = []
    const layout = await page.evaluate(() => ({
      dark: document.documentElement.classList.contains("dark"),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    if (layout.dark !== (theme === "dark")) {
      problems.push(`${label}: page does not follow the ${theme} theme`)
    }
    if (layout.scrollWidth > layout.clientWidth) {
      problems.push(
        `${label}: page scrolls sideways (${layout.scrollWidth}px wide)`
      )
    }
    for (const violation of await runAxe(page, { wholePage: true })) {
      problems.push(violationMessage(label, violation))
    }
    return problems
  } finally {
    await page.close()
  }
}

test("every docs page passes WCAG 2.2 AA, follows the theme, and never scrolls sideways", async () => {
  const docs = await indexEntries("docs")

  const problems = await withSite(({ context, baseUrl }) =>
    inBatches(
      docs.flatMap((entry) =>
        THEMES.flatMap((theme) =>
          WIDTHS.map(
            (width) => () => auditDocs(context, baseUrl, entry, theme, width)
          )
        )
      )
    )
  )

  assertNoProblems(problems, "docs page problems")
})

test("the Tokens page scrolls its tables by keyboard at 390px", async () => {
  await withSite(
    async ({ context, baseUrl }) => {
      const page = await context.newPage()
      await openStory(page, baseUrl, "foundations-tokens--theme")
      const scrollers = await page.evaluate(() =>
        [...document.querySelectorAll("#storybook-root *")]
          .filter((node) => {
            const style = getComputedStyle(node)
            return (
              /auto|scroll/.test(style.overflowX) &&
              node.scrollWidth > node.clientWidth
            )
          })
          .map((node) => ({
            tabIndex: node.getAttribute("tabindex"),
            role: node.getAttribute("role"),
            label: node.getAttribute("aria-label"),
          }))
      )
      assert.ok(scrollers.length > 0, "the token tables overflow at 390px")
      for (const scroller of scrollers) {
        assert.equal(scroller.tabIndex, "0")
        assert.equal(scroller.role, "region")
        assert.ok(scroller.label, "the scroll region has an accessible name")
      }
    },
    { viewport: PHONE }
  )
})
