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

const components = Object.entries(manifest.exports)
  .filter(([, target]) => typeof target === "object")
  .map(([path]) => path.slice(2))

/**
 * Modules under `src/` that are not public entries: pieces the public
 * modules share, like `internal/`, but kept beside their owners. knip.json
 * lists them as `!src/…` exclusions from its entry files.
 */
const knip = JSON.parse(await readFile(resolve(root, "knip.json"), "utf8"))
const INTERNAL = new Set(
  (knip.workspaces["."].entry as string[])
    .filter((pattern) => pattern.startsWith("!src/"))
    .map((pattern) => pattern.slice("!src/".length).replace(/\.tsx?$/, ""))
)

/** Public module name → its source file, for every module `src/` holds. */
async function sourceFiles() {
  const files = new Map<string, string>()
  for (const dir of ["", "form/", "next/"]) {
    for (const file of await readdir(resolve(root, "src", dir))) {
      const match = /^([^.]+)\.tsx?$/.exec(file)
      if (!match || INTERNAL.has(`${dir}${match[1]}`)) continue
      files.set(`${dir}${match[1]}`, resolve(root, "src", dir, file))
    }
  }
  return files
}

const sources = await sourceFiles()

/** Feature entries that may import optional peers. Everything else is core. */
const featureEntries = new Set([
  "calendar",
  "date-picker",
  "date-time-picker",
  "form/date-picker-field",
  "form/date-time-picker-field",
  "form/markdown-field",
  "kanban",
  "markdown",
  "next/nav-link",
  "next/period-stepper",
  "next/tabs-nav-link",
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

const optionalPeers = Object.entries(manifest.peerDependenciesMeta)
  .filter(([, metadata]) => metadata.optional)
  .map(([name]) => name)

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
        'import { NavLink } from "./dist/next/nav-link.js"; import { TabsNavLink } from "./dist/next/tabs-nav-link.js"; console.log(typeof NavLink, typeof TabsNavLink)',
      ],
      { cwd: root }
    )
    expect(stdout.trim()).toBe("function function")
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

  it("exports every public module in src/ and nothing else", () => {
    // A new src/ module without a package.json export, or an export whose
    // module is gone, fails here instead of in an app's import.
    expect([...components].sort()).toEqual([...sources.keys()].sort())
  })

  it("documents each feature entry's install with the kit's peer ranges", async () => {
    // COMPONENTS.md's optional-peer table is what people copy; its ranges
    // must be package.json's, and its rows must cover every feature entry.
    const docs = await readFile(resolve(root, "COMPONENTS.md"), "utf8")
    const rows = [...docs.matchAll(/^\| (.+?) +\| `npm i (.+?)` +\|$/gm)]
    expect(rows.length).toBeGreaterThan(0)
    const documented = new Set<string>()
    for (const [, entries, install] of rows) {
      for (const [, entry] of entries!.matchAll(/`([^`]+)`/g)) {
        documented.add(entry!)
      }
      for (const spec of install!.split(/\s+/)) {
        const at = spec.lastIndexOf("@")
        const name = spec.slice(0, at)
        expect(
          manifest.peerDependencies[name],
          `${spec} in COMPONENTS.md must match package.json`
        ).toBe(spec.slice(at + 1))
      }
    }
    expect([...documented].sort()).toEqual([...featureEntries].sort())
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
    for (const name of optionalPeers) {
      expect(manifest.dependencies[name]).toBeUndefined()
      expect(manifest.peerDependencies[name]).toEqual(expect.any(String))
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
    const core = components.filter((name) => !featureEntries.has(name))
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

  it("loads the calendar and markdown renderer on demand", async () => {
    // Pickers and the markdown field draw their trigger and textarea up
    // front; the calendar and preview renderer arrive when first shown.
    const deferred = {
      "date-picker": ["calendar", "react-day-picker"],
      "date-time-picker": ["calendar", "react-day-picker"],
      "form/date-picker-field": ["calendar", "react-day-picker"],
      "form/date-time-picker-field": ["calendar", "react-day-picker"],
      "form/markdown-field": ["markdown", "react-markdown", "remark-gfm"],
    }
    for (const [entry, heavy] of Object.entries(deferred)) {
      const { visited, bare } = await collectedImports(entry)
      const eager = heavy.filter((name) => visited.has(name) || bare.has(name))
      expect(eager, `${entry} must not load these up front`).toEqual([])
    }
  })

  it("keeps QCheck's entries public and core", () => {
    for (const name of qcheckEntries) {
      expect(
        manifest.exports[`./${name}`],
        `${name} must stay a public entry`
      ).toBeDefined()
      expect(featureEntries.has(name), `${name} must stay a core entry`).toBe(
        false
      )
    }
  })

  it("names the toast module and its types after the kit, not the library underneath", async () => {
    // Apps import toasts from atlas-react-kit/toast; the toast library is an
    // implementation detail that can change without touching app code.
    expect(manifest.exports["./sonner"]).toBeUndefined()
    const types = await readFile(resolve(root, "dist/toast.d.ts"), "utf8")
    expect(types).not.toMatch(/sonner/i)
  })

  it("preserves each module's client boundary through compilation", async () => {
    // The compiled file starts with "use client" exactly when the source
    // does: dropping it breaks hooks and handlers in a server component,
    // and adding it drags a client boundary into a server-safe module.
    for (const [name, file] of sources) {
      const source = await readFile(file, "utf8")
      const compiled = await readFile(resolve(root, `dist/${name}.js`), "utf8")
      expect(
        compiled.startsWith('"use client";'),
        `dist/${name}.js must carry "use client" exactly when src does`
      ).toBe(source.startsWith('"use client"'))
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
    const navLink = await import("../dist/nav-link.js")
    expect(typeof button.Button).toBe("function")
    expect(typeof tabs.TabsNav).toBe("function")
    // The base link lives in `tabs`; only `next/tabs-nav-link` needs Next.
    expect(typeof tabs.TabsNavLink).toBe("function")
    expect(typeof navLink.NavLink).toBe("function")
    expect(typeof navLink.navLinkVariants).toBe("function")
  })
})
