export const GITHUB_URL = "https://github.com/Kerubi-5/atlas-design-system"
export const NPM_URL = "https://www.npmjs.com/package/atlas-react-kit"
const GITHUB_NOTICE = `${GITHUB_URL}/blob/main/NOTICE`
const GITHUB_CONTRIBUTING = `${GITHUB_URL}/blob/main/CONTRIBUTING.md`

// Storybook's docs links turn a leading-slash href into `./?path=<href>`, so
// targets are story paths, not full `/?path=...` URLs.
const docLinkMap: Record<string, string> = {
  "./DESIGN_RULES.md": "/docs/docs-design-rules--docs",
  "./COMPONENTS.md": "/docs/docs-components--docs",
  "./README.md": "/docs/docs-readme--docs",
  "./NOTICE": GITHUB_NOTICE,
  "./CONTRIBUTING.md": GITHUB_CONTRIBUTING,
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

/** Put GitHub and npm links under the README's title on the docs landing page. */
export function addProjectLinks(markdown: string) {
  return markdown.replace(
    /^(# .+\n)/,
    `$1\n[GitHub](${GITHUB_URL}) · [npm](${NPM_URL})\n`
  )
}
