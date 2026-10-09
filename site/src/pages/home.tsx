import kit from "../../../package.json"
import { Badge } from "../../../src/badge.js"
import { Button } from "../../../src/button.js"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../src/card.js"

import { InternalLink } from "../components/internal-link.js"
import { GITHUB_URL, NPM_URL } from "../lib/links.js"

const highlights = [
  {
    href: "/playground",
    title: "Playground",
    description:
      "Every file in stories/ is globbed into a live canvas. Add a story and it shows up on the next build.",
  },
  {
    href: "/tokens",
    title: "Tokens",
    description:
      "Colors, type, and spacing from theme.css, including light and dark values.",
  },
  {
    href: "/docs/readme",
    title: "Docs",
    description:
      "README, component guide, and design rules rendered from the repo markdown.",
  },
] as const

export function HomePage() {
  return (
    <div className="grid gap-12">
      <section className="grid gap-6 border border-border bg-card p-8 shadow-sm ring-1 ring-foreground/5 sm:p-12">
        <Badge variant="soft" tone="neutral">
          atlas-react-kit@{kit.version}
        </Badge>
        <div className="grid max-w-2xl gap-4">
          <h1 className="font-heading text-3xl font-semibold tracking-wider uppercase sm:text-5xl">
            Atlas React Kit
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Shared React components and a Tailwind theme with square corners,
            semantic colors, and distinct selected states. This site is the
            public docs and playground for the kit.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <InternalLink href="/playground">Open playground</InternalLink>
          </Button>
          <Button asChild variant="outline">
            <a href={NPM_URL} rel="noreferrer" target="_blank">
              npm package
            </a>
          </Button>
          <Button asChild variant="ghost">
            <a href={GITHUB_URL} rel="noreferrer" target="_blank">
              GitHub
            </a>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button type="button">Save</Button>
          <Button type="button" variant="outline">
            Clear selection
          </Button>
          <Badge variant="soft" tone="success">
            Paid
          </Badge>
          <span className="bg-selected px-3 py-2 text-sm text-selected-foreground">
            Selected wash
          </span>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <InternalLink key={item.href} href={item.href} className="block">
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs font-semibold tracking-widest text-primary uppercase">
                View
              </CardContent>
            </Card>
          </InternalLink>
        ))}
      </section>
    </div>
  )
}
