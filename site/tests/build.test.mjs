import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import test from "node:test"

const siteRoot = fileURLToPath(new URL("../", import.meta.url))
const repoRoot = path.resolve(siteRoot, "..")
const output = path.join(siteRoot, "dist")
const kit = JSON.parse(
  await fs.readFile(path.join(repoRoot, "package.json"), "utf8")
)

const skipExports = new Set([
  "./theme.css",
  "./package.json",
  "./DESIGN_RULES.md",
  "./COMPONENTS.md",
  // Helpers and the Next adapter are not mountable Storybook canvases.
  "./utils",
  "./next/tabs-nav-link",
])

test("Storybook is the static site at the output root", async () => {
  for (const filename of ["index.html", "iframe.html", "index.json"]) {
    const htmlOrJson = await fs.readFile(path.join(output, filename), "utf8")
    assert.ok(htmlOrJson.length > 0, `${filename} is non-empty`)
  }

  const html = await fs.readFile(path.join(output, "index.html"), "utf8")
  const references = [
    ...html.matchAll(
      /<(?:script|link|img)\b[^>]*\b(?:src|href)=["']([^"']+)["']/g
    ),
  ]
    .map((match) => match[1])
    .filter((reference) => !/^(?:https?:|data:|#)/.test(reference))
  assert.ok(references.length > 0, "index.html has local assets")
  for (const reference of references) {
    const clean = reference.split(/[?#]/)[0]
    const asset = path.join(output, clean)
    await fs.access(asset)
  }
})

test("required interactive stories, tokens, and docs survive the static build", async () => {
  const index = JSON.parse(
    await fs.readFile(path.join(output, "index.json"), "utf8")
  )
  for (const component of [
    "button",
    "badge",
    "input",
    "textarea",
    "select",
    "combobox",
    "date-picker",
    "dialog",
    "card",
    "calendar",
    "checkbox",
    "label",
  ]) {
    assert.equal(
      index.entries[`components-${component}--playground`]?.type,
      "story",
      component
    )
    assert.equal(
      index.entries[`components-${component}--docs`]?.type,
      "docs",
      `${component} autodocs`
    )
  }
  assert.equal(index.entries["tokens--theme"]?.type, "story")
  for (const docsId of [
    "docs-readme--docs",
    "docs-components--docs",
    "docs-design-rules--docs",
  ]) {
    assert.equal(index.entries[docsId]?.type, "docs", docsId)
  }
})

test("every shared demo is rendered by an indexed Storybook entry", async () => {
  const index = JSON.parse(
    await fs.readFile(path.join(output, "index.json"), "utf8")
  )
  const storyFiles = new Set(
    Object.values(index.entries)
      .filter((entry) => entry.type === "story")
      .map((entry) => entry.importPath)
  )
  const storySources = (
    await Promise.all(
      [...storyFiles].map((filename) =>
        fs.readFile(path.resolve(siteRoot, filename), "utf8")
      )
    )
  ).join("\n")
  for (const filename of await fs.readdir(path.join(repoRoot, "stories"))) {
    if (!filename.endsWith(".tsx")) continue
    const source = await fs.readFile(
      path.join(repoRoot, "stories", filename),
      "utf8"
    )
    for (const [, demo] of source.matchAll(/export function (\w+)/g)) {
      assert.match(
        storySources,
        new RegExp(`<${demo}\\b`),
        `${filename}: ${demo} has a preview`
      )
    }
  }
})

test("every visual kit export is imported by a Storybook story", async () => {
  const storiesDir = path.join(siteRoot, "stories")
  const files = await fs.readdir(storiesDir, { recursive: true })
  const storySources = (
    await Promise.all(
      files
        .filter(
          (name) => name.endsWith(".stories.tsx") || name.endsWith(".mdx")
        )
        .map((name) => fs.readFile(path.join(storiesDir, name), "utf8"))
    )
  ).join("\n")
  const preview = await fs.readFile(
    path.join(siteRoot, ".storybook", "preview.tsx"),
    "utf8"
  )
  const rootStorySources = (
    await Promise.all(
      (await fs.readdir(path.join(repoRoot, "stories")))
        .filter((name) => name.endsWith(".tsx"))
        .map((name) =>
          fs.readFile(path.join(repoRoot, "stories", name), "utf8")
        )
    )
  ).join("\n")
  const haystack = `${storySources}\n${preview}\n${rootStorySources}`

  for (const exported of Object.keys(kit.exports)) {
    if (skipExports.has(exported)) continue
    const modulePath = exported.replace("./", "")
    assert.match(
      haystack,
      new RegExp(`src/${modulePath}\\.js`),
      `${exported} has a story import`
    )
  }
})

test("hosting serves Storybook from the site root with SPA fallback", async () => {
  const config = JSON.parse(
    await fs.readFile(path.join(repoRoot, "vercel.json"), "utf8")
  )
  assert.equal(config.outputDirectory, "site/dist")
  assert.equal(
    config.redirects.find((redirect) => redirect.source === "/playground")
      ?.destination,
    "/"
  )
  assert.equal(
    config.redirects.find((redirect) => redirect.source === "/storybook")
      ?.destination,
    "/"
  )
  assert.equal(
    config.redirects.find((redirect) => redirect.source === "/tokens")
      ?.destination,
    "/?path=/story/tokens--theme"
  )
  assert.deepEqual(
    config.rewrites.map((rewrite) => rewrite.source),
    ["/:path*"]
  )
  assert.equal(config.rewrites[0]?.destination, "/index.html")
  await fs.access(path.join(output, "iframe.html"))
  await fs.access(path.join(output, "index.json"))
})
