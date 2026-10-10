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

test("the manager document title is Atlas React Kit", async () => {
  const html = await fs.readFile(path.join(output, "index.html"), "utf8")
  assert.match(html, /<title>[^<]*Atlas React Kit[^<]*<\/title>/)
  const manager = await fs.readFile(
    path.join(siteRoot, ".storybook/manager.ts"),
    "utf8"
  )
  assert.match(manager, /document\.title = KIT_TITLE/)
})

test("the site ships its own icon set", async () => {
  const html = await fs.readFile(path.join(output, "index.html"), "utf8")
  assert.match(
    html,
    /<link rel="icon" type="image\/svg\+xml" href="\.\/favicon\.svg"/
  )
  assert.match(
    html,
    /<link rel="apple-touch-icon" href="\.\/apple-touch-icon\.png"/
  )
  const favicon = await fs.readFile(path.join(output, "favicon.svg"), "utf8")
  // Paths, not <text>: favicons render without the page's web fonts.
  assert.match(favicon, /<path\b/)
  assert.doesNotMatch(favicon, /<text\b/)
  const touch = await fs.readFile(path.join(output, "apple-touch-icon.png"))
  assert.equal(touch.readUInt32BE(16), 180, "touch icon is 180px wide")
  assert.equal(touch.readUInt32BE(20), 180, "touch icon is 180px tall")
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
    "date-time-picker",
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

/** `/docs/<id>` or `/story/<id>` Storybook path → index.json entry id. */
function storyIdFromPath(storyPath) {
  return /^\/(?:docs|story)\/([\w-]+--[\w-]+)$/.exec(storyPath)?.[1]
}

test("every component story has usage guidance", async () => {
  const storiesDir = path.join(siteRoot, "stories")
  const usageSource = await fs.readFile(
    path.join(siteRoot, "src/lib/usage.ts"),
    "utf8"
  )
  const keys = new Set(
    [...usageSource.matchAll(/^  (?:"([^"]+)"|(\w+)): `/gm)].map(
      (match) => match[1] ?? match[2]
    )
  )
  for (const file of await fs.readdir(storiesDir)) {
    if (!file.endsWith(".stories.tsx")) continue
    const source = await fs.readFile(path.join(storiesDir, file), "utf8")
    const title = /title: "Components\/([^"]+)"/.exec(source)?.[1]
    if (!title) continue
    assert.ok(keys.has(title), `${file}: add "${title}" to src/lib/usage.ts`)
  }
})

test("beta labels match between COMPONENTS.md and the docs site", async () => {
  const guide = await fs.readFile(path.join(repoRoot, "COMPONENTS.md"), "utf8")
  const betaLine = /\*\*Beta\*\*[\s\S]*?:([\s\S]*?)\n\n/.exec(guide)?.[1] ?? ""
  const inGuide = [...betaLine.matchAll(/`([a-z-]+)`/g)].map((m) => m[1]).sort()
  const usageSource = await fs.readFile(
    path.join(siteRoot, "src/lib/usage.ts"),
    "utf8"
  )
  const betaBlock = /export const beta = new Set\(\[([\s\S]*?)\]\)/.exec(
    usageSource
  )?.[1]
  const inSite = [...(betaBlock ?? "").matchAll(/"([^"]+)"/g)]
    .map((m) => m[1].toLowerCase().replaceAll(" ", "-"))
    .sort()
  assert.ok(inGuide.length > 0, "COMPONENTS.md lists beta components")
  assert.deepEqual(inSite, inGuide)
})

test("hosting serves Storybook from the site root without an SPA fallback", async () => {
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
  // Storybook routes with `?path=` and loads assets relative to the page. A
  // catch-all rewrite to index.html served the manager for nested paths,
  // where its relative assets resolved to more index.html (blank page).
  // Unknown paths should 404 instead.
  assert.equal(config.rewrites, undefined)
  await fs.access(path.join(output, "iframe.html"))
  await fs.access(path.join(output, "index.json"))
})

test("redirects and doc cross-links point at indexed entries", async () => {
  const index = JSON.parse(
    await fs.readFile(path.join(output, "index.json"), "utf8")
  )
  const config = JSON.parse(
    await fs.readFile(path.join(repoRoot, "vercel.json"), "utf8")
  )
  for (const { destination } of config.redirects) {
    const storyPath = new URL(
      destination,
      "https://site.test"
    ).searchParams.get("path")
    if (!storyPath) continue
    const id = storyIdFromPath(storyPath)
    assert.ok(id && index.entries[id], `redirect ${destination} is indexed`)
  }

  // Storybook's docs Link prefixes a leading-slash href with `./?path=`, so
  // the map holds bare story paths, never `/?path=` URLs.
  const docs = await fs.readFile(path.join(siteRoot, "src/lib/docs.ts"), "utf8")
  const targets = [...docs.matchAll(/"\.\/[\w.]+":\s*"([^"]+)"/g)].map(
    (match) => match[1]
  )
  assert.ok(targets.length >= 3, "docs.ts maps the markdown guides")
  for (const target of targets) {
    assert.doesNotMatch(target, /\?path=/, `${target} is a bare story path`)
    const id = storyIdFromPath(target)
    assert.ok(id && index.entries[id], `doc link ${target} is indexed`)
  }
})
