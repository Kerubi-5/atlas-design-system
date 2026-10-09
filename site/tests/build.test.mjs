import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import test from "node:test"

const siteRoot = fileURLToPath(new URL("../", import.meta.url))
const repoRoot = path.resolve(siteRoot, "..")
const output = path.join(siteRoot, "dist")
const storybook = path.join(output, "storybook")

test("docs and Storybook coexist, with all local entry assets under their own output", async () => {
  for (const [directory, filename] of [
    [output, "index.html"],
    [storybook, "index.html"],
    [storybook, "iframe.html"],
  ]) {
    const html = await fs.readFile(path.join(directory, filename), "utf8")
    const references = [
      ...html.matchAll(
        /<(?:script|link|img)\b[^>]*\b(?:src|href)=["']([^"']+)["']/g
      ),
    ]
      .map((match) => match[1])
      .filter((reference) => !/^(?:https?:|data:|#)/.test(reference))
    assert.ok(references.length > 0, `${filename} has local assets`)
    for (const reference of references) {
      const clean = reference.split(/[?#]/)[0]
      const asset = path.join(clean.startsWith("/") ? output : directory, clean)
      await fs.access(asset)
    }
  }
})

test("required interactive stories and their docs survive the static build", async () => {
  const index = JSON.parse(
    await fs.readFile(path.join(storybook, "index.json"), "utf8")
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
  ]) {
    assert.equal(
      index.entries[`components-${component}--playground`]?.type,
      "story",
      component
    )
    assert.equal(
      index.entries[`components-${component}--docs`]?.type,
      "docs",
      component
    )
  }
})

test("every shared demo is rendered by an indexed Storybook entry", async () => {
  const index = JSON.parse(
    await fs.readFile(path.join(storybook, "index.json"), "utf8")
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

test("hosting redirects old playground links and leaves Storybook files out of SPA rewrites", async () => {
  const config = JSON.parse(
    await fs.readFile(path.join(repoRoot, "vercel.json"), "utf8")
  )
  for (const source of ["/playground", "/storybook"]) {
    assert.equal(
      config.redirects.find((redirect) => redirect.source === source)
        ?.destination,
      "/storybook/"
    )
  }
  // Only docs routes need SPA fallbacks; static Storybook paths resolve as files.
  assert.deepEqual(
    config.rewrites.map((rewrite) => rewrite.source),
    ["/", "/tokens", "/docs/:path*"]
  )
  assert.equal(config.outputDirectory, "site/dist")
  await fs.access(path.join(storybook, "iframe.html"))
  await fs.access(path.join(storybook, "index.json"))
})
