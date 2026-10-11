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
  "accordion",
  "alert",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "calendar",
  "card",
  "checkbox",
  "color-legend",
  "combobox",
  "date-picker",
  "date-time-picker",
  "dialog",
  "dropdown-menu",
  "empty-panel",
  "error-boundary",
  "field",
  "info-tip",
  "input",
  "label",
  "markdown",
  "meter",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "search-picker",
  "select",
  "separator",
  "skeleton",
  "slider",
  "sortable-table-head",
  "spinner",
  "stat-tile",
  "switch",
  "table",
  "table-body-skeleton",
  "tabs",
  "textarea",
  "theme-provider",
  "toast",
  "toggle",
  "toggle-group",
  "tooltip",
  "form/date-picker-field",
  "form/date-time-picker-field",
  "form/field-error",
  "form/feedback-field",
  "form/markdown-field",
  "form/select-field",
  "form/text-field",
  "next/tabs-nav-link",
  "utils",
]

/** Feature entries that may import optional peers. Everything else is core. */
const featureEntries = new Set([
  "calendar",
  "date-picker",
  "date-time-picker",
  "form/date-picker-field",
  "form/date-time-picker-field",
  "form/markdown-field",
  "markdown",
  "theme-provider",
  "toast",
])

/**
 * QCheck's live `atlas-react-kit/` imports (plus `theme.css`, which is CSS
 * only). None of these may pull an optional feature library, even through
 * `internal/` or `utils`.
 */
const qcheckEntries = [
  "badge",
  "button",
  "card",
  "color-legend",
  "empty-panel",
  "info-tip",
  "search-picker",
  "table",
  "tabs",
  "toggle-group",
  "utils",
]

const optionalPeers = [
  "date-fns",
  "next-themes",
  "react-day-picker",
  "react-markdown",
  "remark-gfm",
  "sonner",
]

const optionalPeerPattern = new RegExp(
  `from ["'](?:${optionalPeers.join("|")})(?:/[^"']*)?["']`
)

/**
 * Walk compiled JS from a public entry and collect relative modules plus
 * bare specifiers. Used so a leak through `utils` or `internal/` still
 * fails the core-entry optional-peer check.
 *
 * @param {string} entry Public subpath without `./` (`button`, `form/text-field`).
 */
async function collectedImports(entry) {
  const visited = new Set()
  const bare = new Set()
  const queue = [entry]
  while (queue.length > 0) {
    const name = queue.pop()
    if (!name || visited.has(name)) continue
    visited.add(name)
    const source = await readFile(resolve(root, `dist/${name}.js`), "utf8")
    for (const match of source.matchAll(/from ["']([^"']+)["']/g)) {
      const specifier = match[1]
      if (specifier.startsWith(".")) {
        const next = resolve(root, "dist", name, "..", specifier)
          .replace(/\\/g, "/")
          .replace(/^.*\/dist\//, "")
          .replace(/\.js$/, "")
        queue.push(next)
      } else {
        bare.add(specifier)
      }
    }
  }
  return { visited, bare }
}

describe("published modules", () => {
  it("keeps card padding in the theme component layer so px-0 overrides it", async () => {
    const theme = await readFile(resolve(root, "theme.css"), "utf8")
    expect(theme).toContain("@layer components")
    expect(theme).toContain('[data-slot="card-content"]')
    expect(theme).toContain("padding-inline: var(--card-p)")
    expect(theme).toContain('[data-slot="table-container"]')
    expect(theme).toContain(
      "background-attachment: local, local, scroll, scroll"
    )
    expect(theme).toContain('[data-slot="card"] [data-slot="table-container"]')
    expect(theme).toContain("--table-scroll-fade: var(--card)")
    expect(theme).toContain('[data-slot="tabs-scroller"]')
    expect(theme).toContain("--tabs-scroll-fade: var(--muted)")
    expect(theme).toContain(
      "background-attachment: local, local, scroll, scroll, scroll"
    )
    expect(theme).toContain("scrollbar-width: none")
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
      "skills",
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
    for (const name of optionalPeers) {
      expect(manifest.dependencies[name]).toBeUndefined()
      expect(manifest.peerDependencies[name]).toBe(
        manifest.devDependencies[name]
      )
      expect(manifest.peerDependenciesMeta[name].optional).toBe(true)
    }
    for (const name of [
      "class-variance-authority",
      "clsx",
      "lucide-react",
      "radix-ui",
      "tailwind-merge",
      "tw-animate-css",
    ]) {
      expect(manifest.dependencies[name]).toEqual(expect.any(String))
    }
  })

  it("keeps optional feature libraries out of every core entry, including transitive internals", async () => {
    for (const name of components) {
      if (featureEntries.has(name)) continue
      const { bare } = await collectedImports(name)
      const leaked = [...bare].filter((specifier) =>
        optionalPeerPattern.test(`from "${specifier}"`)
      )
      expect(leaked, `${name} must not import optional peers`).toEqual([])
    }
  })

  it("imports each core entry while optional peers are unresolvable", async () => {
    const core = [
      ...new Set([
        ...components.filter((name) => !featureEntries.has(name)),
        ...qcheckEntries,
      ]),
    ]
    const loader = resolve(root, "test/register-optional-peers.mjs")
    const { stdout } = await runNode(
      process.execPath,
      [
        "--import",
        loader,
        "--input-type=module",
        "-e",
        `await Promise.all(${JSON.stringify(core)}.map((name) => import(new URL("./dist/" + name + ".js", import.meta.url).href))); console.log("ok")`,
      ],
      { cwd: root }
    )
    expect(stdout.trim()).toBe("ok")
  })

  it("treats QCheck's entry set as core: no optional peers, even transitively", async () => {
    for (const name of qcheckEntries) {
      expect(featureEntries.has(name), `${name} must stay a core entry`).toBe(
        false
      )
      const { bare } = await collectedImports(name)
      const leaked = [...bare].filter((specifier) =>
        optionalPeerPattern.test(`from "${specifier}"`)
      )
      expect(leaked, `${name} must not import optional peers`).toEqual([])
    }
  })

  it("names the toast module and its types after the kit, not the library underneath", async () => {
    // Apps import toasts from atlas-react-kit/toast; the toast library is an
    // implementation detail that can change without touching app code.
    expect(manifest.exports["./sonner"]).toBeUndefined()
    const types = await readFile(resolve(root, "dist/toast.d.ts"), "utf8")
    expect(types).not.toMatch(/sonner/i)
  })

  it("preserves client boundaries for hooks and event handlers", async () => {
    for (const name of [
      "accordion",
      "avatar",
      "calendar",
      "checkbox",
      "combobox",
      "date-picker",
      "date-time-picker",
      "dialog",
      "dropdown-menu",
      "error-boundary",
      "field",
      "info-tip",
      "label",
      "popover",
      "progress",
      "radio-group",
      "search-picker",
      "select",
      "separator",
      "slider",
      "sortable-table-head",
      "switch",
      "table",
      "tabs",
      "theme-provider",
      "toast",
      "toggle",
      "toggle-group",
      "tooltip",
      "form/date-picker-field",
      "form/date-time-picker-field",
      "form/markdown-field",
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
