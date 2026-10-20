import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

/**
 * The kit's own files, for tests that check source text rather than
 * behavior (shared styles, layers, theme.css rules).
 */
const repoRoot = path.resolve(import.meta.dirname, "..")

/** A file's text, by its path from the repo root (`"theme.css"`). */
export function readRepoFile(file: string) {
  return readFileSync(path.join(repoRoot, file), "utf8")
}

/**
 * Every module in `src/` as `[file, source]`, `file` relative to `src/`
 * with the platform separator (`internal/math.ts`).
 */
export function srcModules() {
  return readdirSync(path.join(repoRoot, "src"), {
    recursive: true,
    encoding: "utf8",
  })
    .filter((file) => /\.tsx?$/.test(file) && !file.endsWith(".d.ts"))
    .map((file) => [file, readRepoFile(path.join("src", file))] as const)
}
