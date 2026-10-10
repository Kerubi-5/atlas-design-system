const GITHUB_NOTICE =
  "https://github.com/Kerubi-5/atlas-design-system/blob/main/NOTICE"

// Storybook's docs links turn a leading-slash href into `./?path=<href>`, so
// targets are story paths, not full `/?path=...` URLs.
const docLinkMap: Record<string, string> = {
  "./DESIGN_RULES.md": "/docs/docs-design-rules--docs",
  "./COMPONENTS.md": "/docs/docs-components--docs",
  "./README.md": "/docs/docs-readme--docs",
  "./NOTICE": GITHUB_NOTICE,
}

/**
 * Point in-repo markdown links at the Storybook docs entries (or GitHub for
 * NOTICE) so the published guides stay the source of truth.
 */
export function rewriteDocLinks(markdown: string) {
  let next = markdown
  for (const [from, to] of Object.entries(docLinkMap)) {
    next = next.replaceAll(`](${from})`, `](${to})`)
  }
  return next
}
