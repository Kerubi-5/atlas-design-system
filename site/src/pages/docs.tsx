import { cn } from "../../../src/utils.js"
import { tabsTriggerVariants } from "../../../src/internal/tabs-styles.js"
import { TabsNav } from "../../../src/tabs.js"

import { InternalLink } from "../components/internal-link.js"
import { MarkdownView } from "../components/markdown-view.js"
import { docPages } from "../lib/docs.js"

export function DocsPage({ slug }: { slug: string }) {
  const page = docPages.find((item) => item.slug === slug) ?? docPages[0]
  if (!page) return null

  return (
    <div className="grid gap-8">
      <TabsNav aria-label="Docs">
        {docPages.map((item) => {
          const href = `/docs/${item.slug}`
          const active = item.slug === page.slug
          return (
            <InternalLink
              key={item.slug}
              href={href}
              aria-current={active ? "page" : undefined}
              data-state={active ? "active" : "inactive"}
              className={cn(tabsTriggerVariants())}
            >
              {item.title}
            </InternalLink>
          )
        })}
      </TabsNav>
      <header className="grid max-w-2xl gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-wider uppercase">
          {page.title}
        </h1>
        <p className="text-sm text-muted-foreground">{page.description}</p>
      </header>
      <MarkdownView markdown={page.markdown} />
    </div>
  )
}
