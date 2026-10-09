import components from "../../../COMPONENTS.md?raw"
import designRules from "../../../DESIGN_RULES.md?raw"
import readme from "../../../README.md?raw"

export type DocPage = {
  slug: string
  title: string
  description: string
  markdown: string
}

const docLinkMap: Record<string, string> = {
  "./DESIGN_RULES.md": "/docs/design-rules",
  "./COMPONENTS.md": "/docs/components",
  "./README.md": "/",
  "./NOTICE":
    "https://github.com/Kerubi-5/atlas-design-system/blob/main/NOTICE",
}

/**
 * Point in-repo markdown links at playground routes (or GitHub for NOTICE).
 */
export function rewriteDocLinks(markdown: string) {
  let next = markdown
  for (const [from, to] of Object.entries(docLinkMap)) {
    next = next.replaceAll(`](${from})`, `](${to})`)
  }
  return next
}

export const docPages: DocPage[] = [
  {
    slug: "readme",
    title: "README",
    description: "Install, import, and release the kit.",
    markdown: rewriteDocLinks(readme),
  },
  {
    slug: "components",
    title: "Components",
    description: "Exports, options, and composition examples.",
    markdown: rewriteDocLinks(components),
  },
  {
    slug: "design-rules",
    title: "Design rules",
    description: "Tokens, shape, and what belongs in the kit.",
    markdown: rewriteDocLinks(designRules),
  },
]

export function getDocPage(slug: string) {
  return docPages.find((page) => page.slug === slug)
}
