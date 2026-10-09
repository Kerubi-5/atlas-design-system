import { readFile, readdir, access } from "node:fs/promises"
import { execFile } from "node:child_process"
import { resolve } from "node:path"
import { promisify } from "node:util"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "..")
const runNode = promisify(execFile)
const manifest = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8")
)

const components = [
  "badge",
  "button",
  "calendar",
  "card",
  "checkbox",
  "combobox",
  "date-picker",
  "dialog",
  "empty-panel",
  "error-boundary",
  "field",
  "input",
  "label",
  "popover",
  "select",
  "separator",
  "skeleton",
  "sortable-table-head",
  "sonner",
  "table",
  "table-body-skeleton",
  "tabs",
  "textarea",
  "theme-provider",
  "toggle",
  "toggle-group",
  "form/date-picker-field",
  "form/field-error",
  "form/feedback-field",
  "form/select-field",
  "form/text-field",
  "next/tabs-nav-link",
  "utils",
]

describe("published modules", () => {
  it("keeps card padding in the theme component layer so px-0 overrides it", async () => {
    const theme = await readFile(resolve(root, "theme.css"), "utf8")
    expect(theme).toContain("@layer components")
    expect(theme).toContain('[data-slot="card-content"]')
    expect(theme).toContain("padding-inline: var(--card-p)")
  })

  it("resolves the compiled framework adapter in native ESM", async () => {
    const { stdout } = await runNode(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        'import { TabsNavLink } from "./dist/next/tabs-nav-link.js"; console.log(typeof TabsNavLink)',
      ],
      { cwd: root }
    )
    expect(stdout.trim()).toBe("function")
  })

  it("publishes only kit artifacts, not the docs site or stories", () => {
    expect(manifest.files).toEqual([
      "dist",
      "theme.css",
      "DESIGN_RULES.md",
      "COMPONENTS.md",
      "NOTICE",
    ])
  })

  it("exports compiled JavaScript and declarations for every public module", async () => {
    for (const name of components) {
      const entry = manifest.exports[`./${name}`]
      expect(entry).toEqual({
        types: `./dist/${name}.d.ts`,
        default: `./dist/${name}.js`,
      })
      await access(resolve(root, entry.types))
      await access(resolve(root, entry.default))
    }
    expect(manifest.exports["./theme.css"]).toBe("./theme.css")
    expect(manifest.peerDependenciesMeta.next.optional).toBe(true)
  })

  it("preserves client boundaries for hooks and event handlers", async () => {
    for (const name of [
      "calendar",
      "checkbox",
      "combobox",
      "date-picker",
      "dialog",
      "error-boundary",
      "field",
      "label",
      "popover",
      "select",
      "separator",
      "sortable-table-head",
      "sonner",
      "table",
      "tabs",
      "theme-provider",
      "toggle",
      "toggle-group",
      "form/date-picker-field",
      "form/select-field",
      "form/text-field",
      "next/tabs-nav-link",
    ]) {
      const source = await readFile(resolve(root, `dist/${name}.js`), "utf8")
      expect(source.startsWith('"use client";')).toBe(true)
    }
  })

  it("keeps the core free of application aliases and the optional framework", async () => {
    const files = await readdir(resolve(root, "dist"), { recursive: true })
    for (const name of files.filter((file) => file.endsWith(".js"))) {
      const source = await readFile(resolve(root, "dist", name), "utf8")
      expect(source).not.toMatch(/@\/|@kairos\//)
      if (!name.startsWith("next/")) {
        expect(source).not.toMatch(/from ["']next\//)
      }
    }
  })

  it("imports generic component modules without the framework adapter", async () => {
    const button = await import("../dist/button.js")
    const tabs = await import("../dist/tabs.js")
    expect(typeof button.Button).toBe("function")
    expect(typeof tabs.TabsNav).toBe("function")
    expect(tabs).not.toHaveProperty("TabsNavLink")
  })
})
