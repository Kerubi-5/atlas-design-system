import { readdir, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const dist = resolve(import.meta.dirname, "../dist")

/**
 * `Calendar` is a documented Day Picker wrapper, so its props stay Day
 * Picker's. Every other public type, the pickers and form fields included,
 * is the kit's own, so a Day Picker major cannot change the kit's API.
 */
const dayPickerWrappers = new Set(["calendar.d.ts"])

async function declarationFiles(dir: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? declarationFiles(resolve(dir, entry.name), `${prefix}${entry.name}/`)
        : entry.name.endsWith(".d.ts")
          ? [`${prefix}${entry.name}`]
          : []
    )
  )
  return files.flat()
}

describe("public types", () => {
  it("do not expose react-day-picker outside Calendar", async () => {
    const leaks: string[] = []
    for (const file of await declarationFiles(dist)) {
      if (dayPickerWrappers.has(file)) continue
      const source = await readFile(resolve(dist, file), "utf8")
      if (source.includes("react-day-picker")) leaks.push(file)
    }
    expect(leaks).toEqual([])
  })
})
