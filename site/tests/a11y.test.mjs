// Accessibility gate: every Storybook story, in light and dark, must pass
// axe-core's WCAG 2.2 A and AA rules. Run after `npm run build` with
// `npm run test:a11y`; CI installs Chromium first (`npx playwright install`).
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
const CONCURRENCY = 4

/**
 * Overlays render in portals and only after interaction, so the per-story
 * pass never sees them. Each is opened here and the whole page is scanned.
 *
 * Open overlays hide the page behind them with aria-hidden. axe's
 * aria-hidden-focus rule cannot tell that focus is trapped unless the overlay
 * is an aria-modal dialog, which menus and listboxes cannot be, so for open
 * overlays that rule is replaced by the behavior it guards: Tab and
 * Shift+Tab must never put focus inside hidden content.
 */
const root = (page) => page.locator("#storybook-root")
const OVERLAYS = [
  [
    "overlays-dialog--playground",
    "[role=dialog]",
    (page) => root(page).getByRole("button").first().click(),
  ],
  [
    "overlays-popover--playground",
    "[role=dialog]",
    (page) => root(page).getByRole("button").first().click(),
  ],
  [
    "overlays-info-tip--playground",
    "[role=dialog]",
    (page) => root(page).getByRole("button").first().click(),
  ],
  [
    "overlays-tooltip--playground",
    "[role=tooltip]",
    (page) => root(page).getByRole("button").first().focus(),
  ],
  [
    "actions-dropdown-menu--row-actions",
    "[role=menu]",
    (page) => page.getByRole("button", { name: "Actions" }).click(),
  ],
  [
    "forms-select--playground",
    "[role=listbox]",
    (page) => root(page).getByRole("combobox").first().click(),
  ],
  [
    "forms-combobox--playground",
    "[role=listbox]",
    (page) => root(page).getByRole("combobox").first().click(),
  ],
  [
    "forms-date-picker--playground",
    "[role=dialog]",
    (page) => root(page).getByRole("button").first().click(),
  ],
  [
    "forms-date-time-picker--playground",
    "[role=dialog]",
    (page) => root(page).getByRole("button").first().click(),
  ],
  [
    "feedback-sonner--playground",
    "[data-sonner-toast]",
    (page) => root(page).getByRole("button").first().click(),
  ],
]

async function auditStory(context, baseUrl, entry, theme, overlay) {
  const page = await context.newPage()
  try {
    await page.goto(
      `${baseUrl}/iframe.html?id=${entry.id}&viewMode=story&globals=theme:${theme}`
    )
    await page.waitForFunction(
      () => /sb-show-main|sb-show-errordisplay/.test(document.body.className),
      null,
      { timeout: 20_000 }
    )
    const errored = await page.evaluate(() =>
      document.body.className.includes("sb-show-errordisplay")
    )
    if (errored) return [`${entry.id} [${theme}]: story failed to render`]

    // Finish transitions now so colours are not sampled mid-animation.
    await page.addStyleTag({
      content:
        "*, *::before, *::after { transition: none !important; animation: none !important; }",
    })
    // Let fonts swap and effects that depend on layout (Table's overflow
    // check) run before sampling; under parallel load they can lag a frame.
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
      await new Promise((resolve) => setTimeout(resolve, 300))
    })
    if (overlay) {
      const [, shows, open] = overlay
      await open(page)
      await page.waitForSelector(shows, { state: "visible", timeout: 10_000 })
      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 300))
      )
    }
    await page.addScriptTag({ content: axeSource })
    const violations = await page.evaluate(
      async ({ tags, wholePage }) => {
        // Storybook's a11y panel runs axe on each render; wait for that run.
        let result
        for (let attempt = 0; ; attempt += 1) {
          try {
            result = await window.axe.run(
              wholePage ? document : document.querySelector("#storybook-root"),
              {
                runOnly: { type: "tag", values: tags },
                resultTypes: ["violations"],
                rules: wholePage
                  ? { "aria-hidden-focus": { enabled: false } }
                  : {},
              }
            )
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
      },
      { tags: WCAG_TAGS, wholePage: Boolean(overlay) }
    )

    const label = overlay ? `${entry.id} (open)` : entry.id
    const problems = violations.map(
      (violation) =>
        `${label} [${theme}]: ${violation.id} (${violation.help}) at ${violation.targets.slice(0, 3).join(", ")}`
    )
    if (overlay) {
      for (const key of ["Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab"]) {
        await page.keyboard.press(key)
        const hidden = await page.evaluate(() => {
          const active = document.activeElement
          return active?.closest('[aria-hidden="true"]')
            ? active.outerHTML.slice(0, 80)
            : null
        })
        if (hidden) {
          problems.push(
            `${label} [${theme}]: ${key} moved focus into hidden content: ${hidden}`
          )
        }
      }
    }
    return problems
  } finally {
    await page.close()
  }
}

test("every story passes WCAG 2.2 AA checks in light and dark", async () => {
  const index = JSON.parse(
    await fs.readFile(path.join(distDir, "index.json"), "utf8")
  )
  const stories = Object.values(index.entries).filter(
    (entry) => entry.type === "story"
  )
  assert.ok(stories.length > 0, "index.json lists stories")

  const server = await serve()
  const baseUrl = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  const context = await browser.newContext({ reducedMotion: "reduce" })

  const jobs = stories.flatMap((entry) =>
    THEMES.map((theme) => () => auditStory(context, baseUrl, entry, theme))
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
    `${problems.length} accessibility violations:\n${problems.join("\n")}`
  )
})

test("open overlays pass WCAG 2.2 AA checks in light and dark", async () => {
  const index = JSON.parse(
    await fs.readFile(path.join(distDir, "index.json"), "utf8")
  )
  for (const [id] of OVERLAYS) {
    assert.ok(index.entries[id], `${id} is in the story index`)
  }
  const server = await serve()
  const baseUrl = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  const context = await browser.newContext({ reducedMotion: "reduce" })
  const problems = []
  try {
    for (const overlay of OVERLAYS) {
      for (const theme of THEMES) {
        problems.push(
          ...(await auditStory(
            context,
            baseUrl,
            index.entries[overlay[0]],
            theme,
            overlay
          ))
        )
      }
    }
  } finally {
    await browser.close()
    server.close()
  }
  assert.deepEqual(
    problems,
    [],
    `${problems.length} accessibility violations:\n${problems.join("\n")}`
  )
})
