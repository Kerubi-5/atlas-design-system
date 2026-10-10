import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

/**
 * The kit's layers, bottom to top:
 * - helpers: `utils.ts` and `internal/*` (shared classes and hooks);
 * - components: the top-level modules (`button`, `combobox`, ...), which may
 *   build on each other (Combobox uses Button, Input, and Popover);
 * - adapters: `form/*` (form-library fields) and `next/*` (framework links).
 * Imports point down or sideways, never up, and never in a cycle, so any
 * component can be used without pulling in an adapter.
 */
const srcDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src"
)

function layerOf(module: string) {
  if (module === "utils" || module.startsWith("internal/")) return 0
  if (module.startsWith("form/") || module.startsWith("next/")) return 2
  return 1
}

const graph = new Map<string, string[]>()
for (const file of readdirSync(srcDir, { recursive: true, encoding: "utf8" })) {
  if (!/\.tsx?$/.test(file) || file.endsWith(".d.ts")) continue
  const module = file
    .replace(/\.tsx?$/, "")
    .split(path.sep)
    .join("/")
  const source = readFileSync(path.join(srcDir, file), "utf8")
  const imports = [...source.matchAll(/from "(\.{1,2}\/[^"]+)\.js"/g)].map(
    (match) =>
      path.posix.normalize(
        path.posix.join(path.posix.dirname(module), match[1]!)
      )
  )
  graph.set(module, imports)
}

describe("module layers", () => {
  it("finds the kit's modules", () => {
    expect(graph.has("button")).toBe(true)
    expect(graph.has("form/text-field")).toBe(true)
    expect(graph.size).toBeGreaterThan(40)
  })

  it("only imports modules that exist", () => {
    for (const [module, imports] of graph) {
      for (const target of imports) {
        expect(graph.has(target), `${module} imports ${target}`).toBe(true)
      }
    }
  })

  it("never imports up a layer", () => {
    for (const [module, imports] of graph) {
      for (const target of imports) {
        expect(
          layerOf(target) <= layerOf(module),
          `${module} (layer ${layerOf(module)}) imports ${target} (layer ${layerOf(target)})`
        ).toBe(true)
      }
    }
  })

  it("has no import cycles", () => {
    const done = new Set<string>()
    const visit = (module: string, trail: string[]) => {
      if (trail.includes(module)) {
        throw new Error(`cycle: ${[...trail, module].join(" -> ")}`)
      }
      if (done.has(module)) return
      for (const target of graph.get(module) ?? []) {
        visit(target, [...trail, module])
      }
      done.add(module)
    }
    for (const module of graph.keys()) visit(module, [])
  })
})
