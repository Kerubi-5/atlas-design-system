// Accessibility gate: every Storybook story, in light and dark, must pass
// axe-core's WCAG 2.2 A and AA rules. Run after `npm run build` with
// `npm run test:a11y`; CI installs Chromium first (`npx playwright install`).
import assert from "node:assert/strict"
import fs from "node:fs/promises"
import http from "node:http"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import test from "node:test"

import { chromium } from "playwright"

const require = createRequire(import.meta.url)
const siteRoot = fileURLToPath(new URL("../", import.meta.url))
const output = path.join(siteRoot, "dist")
const axeSource = await fs.readFile(
  require.resolve("axe-core/axe.min.js"),
  "utf8"
)

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
const THEMES = ["light", "dark"]
const CONCURRENCY = 4

const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
}

function serve(root) {
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost")
    let file = path.join(root, decodeURIComponent(url.pathname))
    if (!file.startsWith(root)) {
      response.writeHead(403).end()
      return
    }
    if (url.pathname.endsWith("/")) file = path.join(file, "index.html")
    try {
      const body = await fs.readFile(file)
      response.writeHead(200, {
        "content-type":
          contentTypes[path.extname(file)] ?? "application/octet-stream",
      })
      response.end(body)
    } catch {
      response.writeHead(404).end()
    }
  })
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server))
  })
}

async function auditStory(context, baseUrl, entry, theme) {
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
    await page.addScriptTag({ content: axeSource })
    const violations = await page.evaluate(async (tags) => {
      // Storybook's a11y panel runs axe on each render; wait for that run.
      let result
      for (let attempt = 0; ; attempt += 1) {
        try {
          result = await window.axe.run(
            document.querySelector("#storybook-root"),
            {
              runOnly: { type: "tag", values: tags },
              resultTypes: ["violations"],
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
    }, WCAG_TAGS)

    return violations.map(
      (violation) =>
        `${entry.id} [${theme}]: ${violation.id} (${violation.help}) at ${violation.targets.slice(0, 3).join(", ")}`
    )
  } finally {
    await page.close()
  }
}

test("every story passes WCAG 2.2 AA checks in light and dark", async () => {
  const index = JSON.parse(
    await fs.readFile(path.join(output, "index.json"), "utf8")
  )
  const stories = Object.values(index.entries).filter(
    (entry) => entry.type === "story"
  )
  assert.ok(stories.length > 0, "index.json lists stories")

  const server = await serve(output)
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
