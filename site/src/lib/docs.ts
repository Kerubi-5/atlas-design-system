const GITHUB_NOTICE =
  "https://github.com/Kerubi-5/atlas-design-system/blob/main/NOTICE"

const docLinkMap: Record<string, string> = {
  "./DESIGN_RULES.md": "/?path=/docs/docs-design-rules--docs",
  "./COMPONENTS.md": "/?path=/docs/docs-components--docs",
  "./README.md": "/?path=/docs/docs-readme--docs",
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
