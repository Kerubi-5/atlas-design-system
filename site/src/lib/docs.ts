export const GITHUB_URL = "https://github.com/Kerubi-5/atlas-design-system"
export const NPM_URL = "https://www.npmjs.com/package/atlas-react-kit"
const GITHUB_NOTICE = `${GITHUB_URL}/blob/main/NOTICE`
const GITHUB_CONTRIBUTING = `${GITHUB_URL}/blob/main/CONTRIBUTING.md`
const GITHUB_ROADMAP = `${GITHUB_URL}/blob/main/ROADMAP-1.0.md`
const GITHUB_CHANGELOG = `${GITHUB_URL}/blob/main/CHANGELOG.md`
const GITHUB_SKILL = `${GITHUB_URL}/blob/main/skills/atlas-react-kit/SKILL.md`

// Storybook's docs links turn a leading-slash href into `./?path=<href>`, so
// targets are story paths, not full `/?path=...` URLs.
const docLinkMap: Record<string, string> = {
  "./DESIGN_RULES.md": "/docs/docs-design-rules--docs",
  "./COMPONENTS.md": "/docs/docs-components--docs",
  "./README.md": "/docs/docs-readme--docs",
  "./NOTICE": GITHUB_NOTICE,
  "./CONTRIBUTING.md": GITHUB_CONTRIBUTING,
  "./ROADMAP-1.0.md": GITHUB_ROADMAP,
  "./CHANGELOG.md": GITHUB_CHANGELOG,
  "./skills/atlas-react-kit/SKILL.md": GITHUB_SKILL,
}

/**
 * Point in-repo markdown links at the Storybook docs entries (or GitHub for
 * NOTICE) so the published guides stay the source of truth.
 */
export function rewriteDocLinks(markdown: string) {
  return markdown.replace(
    /(\]\()([^\s)]+)([^)]*\))/g,
    (match, prefix, url, suffix) => {
      const source = Object.keys(docLinkMap).find(
        (path) =>
          url === path ||
          url.startsWith(`${path}#`) ||
          url.startsWith(`${path}?`)
      )
      return source
        ? `${prefix}${docLinkMap[source]}${url.slice(source.length)}${suffix}`
        : match
    }
  )
}

/** Put GitHub and npm links under the README's title on the docs landing page. */
export function addProjectLinks(markdown: string) {
  return markdown.replace(
    /^(# .+\n)/,
    `$1\n[GitHub](${GITHUB_URL}) · [npm](${NPM_URL})\n`
  )
}
