import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { describe, expect, it } from "vitest"

/**
 * The 1.0 contract, frozen. Every runtime export of every package entry is
 * recorded in `__snapshots__/api-surface.test.ts.snap`. A failure here
 * means the public API changed: adding an export is fine (update the
 * snapshot with `npx vitest run -u` and note it in the changelog); renaming
 * or removing one is breaking and must follow the deprecation steps in
 * CONTRIBUTING.md. Runs against `dist/`, which is what npm ships.
 */
const root = resolve(import.meta.dirname, "..")
const manifest = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8")
)

const entries = Object.entries(
  manifest.exports as Record<string, string | { default: string }>
)
  .filter(([, target]) => typeof target === "object")
  .map(([path, target]) => [path, (target as { default: string }).default])

describe("public API surface", () => {
  it("lists every runtime export per entry point", async () => {
    const surface: Record<string, string[]> = {}
    for (const [path, file] of entries) {
      const mod = await import(pathToFileURL(resolve(root, file)).href)
      surface[path] = Object.keys(mod).sort()
    }
    expect(surface).toMatchSnapshot()
  })
})
