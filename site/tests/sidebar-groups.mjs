// The sidebar's top-level entries, read from `storySort` in
// .storybook/preview.tsx. Storybook parses that literal statically when it
// indexes stories, so preview.tsx cannot import the list; the tests read the
// same literal instead of keeping a copy.
import fs from "node:fs/promises"

const preview = await fs.readFile(
  new URL("../.storybook/preview.tsx", import.meta.url),
  "utf8"
)
const order =
  /storySort: \{\s*order: \[([\s\S]*?)\n\s*\],/.exec(preview)?.[1] ?? ""

/** "Docs", then the component groups, in sidebar order. */
export const sidebarGroups = [
  ...order.replace(/\[[^\]]*\]/g, "").matchAll(/"([^"]+)"/g),
].map((match) => match[1])

if (!sidebarGroups.includes("Forms")) {
  throw new Error("preview.tsx does not list the sidebar groups in storySort")
}
