// Docs-page gate: every autodocs and MDX page, in light and dark, at 1280
// and 390, must pass axe-core's WCAG 2.2 A and AA rules, follow the theme
// toolbar, and never scroll sideways (wide tables and code scroll inside
// their own focusable container instead). Run after `npm run build` with
// `npm run test:a11y`.
import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import { createRequire } from "node:module"
import test from "node:test"

import { chromium } from "playwright"

import { distDir, serve } from "./serve.mjs"

const require = createRequire(import.meta.url)
const axeSource = await fs.readFile(
  require.resolve("axe-core/axe.min.js"),
  "utf8"
)

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
const THEMES = ["light", "dark"]
const WIDTHS = [1280, 390]
const CONCURRENCY = 4

/**
 * Known component findings outside the docs chrome, skipped here so this
 * gate covers the docs site itself. On the Toast page every story's toasts
 * collapse into one docs-wide stack, where the close buttons of the toasts
 * behind sit closer than 24px to the front one (a Toaster issue, tracked
 * separately from the docs-site fixes).
 */
const KNOWN = { "feedback-toast--docs": ["target-size"] }

async function settle(page) {
  await page.addStyleTag({
    content:
      "*, *::before, *::after { transition: none !important; animation: none !important; }",
  })
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    )
    await new Promise((resolve) => setTimeout(resolve, 300))
  })
}

async function runAxe(page) {
  await page.addScriptTag({ content: axeSource })
  return page.evaluate(async (tags) => {
    let result
    for (let attempt = 0; ; attempt += 1) {
      try {
        result = await window.axe.run(document, {
          runOnly: { type: "tag", values: tags },
          resultTypes: ["violations"],
        })
        break
      } catch (error) {
        if (!String(error).includes("already running") || attempt > 50) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }
    return result.violations.map((violation) => ({
      id: violation.id,
      help: violation.help,
      targets: violation.nodes.map((node) => node.target.join(" ")),
    }))
  }, WCAG_TAGS)
}

async function auditDocs(context, baseUrl, entry, theme, width) {
  const label = `${entry.id} [${theme}, ${width}px]`
  const page = await context.newPage()
  try {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(
      `${baseUrl}/iframe.html?id=${entry.id}&viewMode=docs&globals=theme:${theme}`
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
    for (const violation of await runAxe(page)) {
      if (KNOWN[entry.id]?.includes(violation.id)) continue
      problems.push(
        `${label}: ${violation.id} (${violation.help}) at ${violation.targets.slice(0, 3).join(", ")}`
      )
    }
    return problems
  } finally {
    await page.close()
  }
}

test("every docs page passes WCAG 2.2 AA, follows the theme, and never scrolls sideways", async () => {
  const index = JSON.parse(
    await fs.readFile(path.join(distDir, "index.json"), "utf8")
  )
  const docs = Object.values(index.entries).filter(
    (entry) => entry.type === "docs"
  )
  assert.ok(docs.length > 0, "index.json lists docs pages")

  const server = await serve()
  const baseUrl = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  const context = await browser.newContext({ reducedMotion: "reduce" })

  const jobs = docs.flatMap((entry) =>
    THEMES.flatMap((theme) =>
      WIDTHS.map(
        (width) => () => auditDocs(context, baseUrl, entry, theme, width)
      )
    )
  )
  const problems = []
  try {
    for (let i = 0; i < jobs.length; i += CONCURRENCY) {
      const batch = await Promise.all(
        jobs.slice(i, i + CONCURRENCY).map((job) => job())
      )
      problems.push(...batch.flat())
    }
  } finally {
    await browser.close()
    server.close()
  }

  assert.deepEqual(
    problems,
    [],
    `${problems.length} docs page problems:\n${problems.join("\n")}`
  )
})

test("the Tokens page scrolls its tables by keyboard at 390px", async () => {
  const server = await serve()
  const baseUrl = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  try {
    await page.goto(
      `${baseUrl}/iframe.html?id=foundations-tokens--theme&viewMode=story&globals=theme:light`
    )
    await page.waitForSelector("body.sb-show-main")
    await settle(page)
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
  } finally {
    await browser.close()
    server.close()
  }
})
