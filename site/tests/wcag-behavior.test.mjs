// WCAG checks that axe-core cannot make (tests/a11y.test.mjs runs axe). For
// every story: each control reached with Tab shows a focus indicator in
// light, dark and forced colors (2.4.7), and is not covered by other content
// (2.4.11); the page reflows at 320px without scrolling sideways (1.4.10);
// and WCAG's text-spacing overrides clip no text (1.4.12).
import assert from "node:assert/strict"
import test from "node:test"

import { openStory, storyIndex, withSite } from "./browser.mjs"

const CONCURRENCY = 4
const MAX_TABS = 40
const TEXT_SPACING =
  "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }"
// Kanban cards ring the whole card while the grip has focus.
const RING_ON_PARENT = new Set(["kanban-card-handle"])

function describe(element) {
  const slot = element.getAttribute("data-slot")
  const name = (element.getAttribute("aria-label") || element.textContent || "")
    .trim()
    .slice(0, 30)
  return `${element.tagName.toLowerCase()}${slot ? `[${slot}]` : ""}${name ? ` "${name}"` : ""}`
}

/** Tab through the story and report controls without a visible focus cue. */
async function focusProblems(page, label, { forced, ringOnParent }) {
  await page.evaluate(() => document.activeElement?.blur())
  const seen = new Set()
  const problems = []
  for (let i = 0; i < MAX_TABS; i += 1) {
    await page.keyboard.press("Tab")
    const result = await page.evaluate(
      ({ describeSource, ringOnParent }) => {
        const describe = new Function(`return ${describeSource}`)()
        const element = document.activeElement
        if (!element || element === document.body) return null
        const inStory =
          document.querySelector("#storybook-root").contains(element) ||
          element.closest(
            "[data-radix-popper-content-wrapper],[role=dialog],[data-sonner-toaster]"
          )
        if (!inStory) return null
        const style = getComputedStyle(element)
        const outline =
          style.outlineStyle !== "none" &&
          parseFloat(style.outlineWidth) > 0 &&
          !/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(style.outlineColor)
        const ring =
          style.boxShadow !== "none" ||
          ringOnParent.includes(element.getAttribute("data-slot"))
        const bounds = element.getBoundingClientRect()
        const x = Math.min(
          Math.max(bounds.left + bounds.width / 2, 0),
          innerWidth - 1
        )
        const y = Math.min(
          Math.max(bounds.top + bounds.height / 2, 0),
          innerHeight - 1
        )
        const hit = document.elementFromPoint(x, y)
        const covered =
          bounds.width > 0 &&
          hit &&
          !element.contains(hit) &&
          !hit.contains(element) &&
          !(element.labels && [...element.labels].some((l) => l.contains(hit)))
        return {
          key: `${describe(element)}@${Math.round(bounds.left)},${Math.round(bounds.top)}`,
          what: describe(element),
          outline,
          ring,
          covered: covered ? describe(hit) : null,
        }
      },
      { describeSource: describe.toString(), ringOnParent: [...ringOnParent] }
    )
    if (!result || seen.has(result.key)) break
    seen.add(result.key)
    // Forced colors drop box-shadow, so only an outline shows there.
    if (forced ? !result.outline : !(result.outline || result.ring))
      problems.push(`${label}: no visible focus on ${result.what}`)
    if (!forced && result.covered)
      problems.push(
        `${label}: focused ${result.what} is covered by ${result.covered}`
      )
  }
  return problems
}

async function auditStory(browser, baseUrl, entry) {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()
  const problems = []
  try {
    for (const theme of ["light", "dark"]) {
      await openStory(page, baseUrl, entry.id, theme)
      problems.push(
        ...(await focusProblems(page, `${entry.id} [${theme}]`, {
          forced: false,
          ringOnParent: RING_ON_PARENT,
        }))
      )
    }
    await page.emulateMedia({ forcedColors: "active" })
    await openStory(page, baseUrl, entry.id)
    problems.push(
      ...(await focusProblems(page, `${entry.id} [forced colors]`, {
        forced: true,
        ringOnParent: RING_ON_PARENT,
      }))
    )
    await page.emulateMedia({ forcedColors: "none" })

    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, baseUrl, entry.id)
    const reflow = await page.evaluate((describeSource) => {
      const describe = new Function(`return ${describeSource}`)()
      if (document.documentElement.scrollWidth <= innerWidth + 1) return null
      const scrolls = (element) => {
        for (let p = element.parentElement; p; p = p.parentElement) {
          if (/auto|scroll|hidden|clip/.test(getComputedStyle(p).overflowX))
            return true
        }
        return false
      }
      const wide = [...document.querySelectorAll("#storybook-root *")].filter(
        (element) =>
          element.getBoundingClientRect().right > innerWidth + 1 &&
          !scrolls(element)
      )
      return wide
        .filter((element) => !wide.includes(element.parentElement))
        .slice(0, 3)
        .map(describe)
        .join(", ")
    }, describe.toString())
    if (reflow !== null)
      problems.push(`${entry.id}: scrolls sideways at 320px (${reflow})`)

    await page.setViewportSize({ width: 1280, height: 900 })
    await openStory(page, baseUrl, entry.id)
    const clipped = (describeSource) => {
      const describe = new Function(`return ${describeSource}`)()
      const result = {}
      for (const element of document.querySelectorAll("#storybook-root *")) {
        const hasText = [...element.childNodes].some(
          (node) => node.nodeType === 3 && node.textContent.trim()
        )
        if (!hasText) continue
        const style = getComputedStyle(element)
        if (!/hidden|clip/.test(style.overflowX + style.overflowY)) continue
        const key = `${describe(element)}#${[...element.parentElement.children].indexOf(element)}`
        result[key] =
          element.scrollWidth > element.clientWidth + 1 ||
          element.scrollHeight > element.clientHeight + 1
      }
      return result
    }
    const before = await page.evaluate(clipped, describe.toString())
    await page.addStyleTag({ content: TEXT_SPACING })
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )
    )
    const after = await page.evaluate(clipped, describe.toString())
    const newlyClipped = Object.keys(after).filter(
      (key) => after[key] && before[key] === false
    )
    if (newlyClipped.length)
      problems.push(
        `${entry.id}: text spacing clips ${newlyClipped.slice(0, 3).join(", ")}`
      )
  } finally {
    await context.close()
  }
  return problems
}

test("every story keeps focus visible, reflows at 320px, and survives text spacing", async () => {
  const index = await storyIndex()
  const stories = Object.values(index.entries).filter(
    (entry) => entry.type === "story"
  )
  assert.ok(stories.length > 0, "index.json lists stories")
  const problems = await withSite(async ({ browser, baseUrl }) => {
    const found = []
    for (let i = 0; i < stories.length; i += CONCURRENCY) {
      const batch = await Promise.all(
        stories
          .slice(i, i + CONCURRENCY)
          .map((entry) => auditStory(browser, baseUrl, entry))
      )
      found.push(...batch.flat())
    }
    return found
  })
  assert.deepEqual(
    problems,
    [],
    `${problems.length} problems:\n${problems.join("\n")}`
  )
})
