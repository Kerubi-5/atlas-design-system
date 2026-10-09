import type { ReactNode } from "react"

import { cn } from "../../../src/utils.js"
import { tabsTriggerVariants } from "../../../src/internal/tabs-styles.js"
import { TabsNav } from "../../../src/tabs.js"

import {
  GITHUB_URL,
  NPM_URL,
  navItemIsActive,
  primaryNav,
} from "../lib/links.js"
import { InternalLink } from "./internal-link.js"
import { ThemeToggle } from "./theme-toggle.js"

export function Shell({
  pathname,
  children,
}: {
  pathname: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <InternalLink href="/" className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center bg-primary font-heading text-sm font-semibold tracking-widest text-primary-foreground">
                A
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-heading text-xs font-semibold tracking-widest uppercase">
                  Atlas
                </span>
                <span className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                  React Kit
                </span>
              </span>
            </InternalLink>
            <div className="ml-auto flex items-center gap-3">
              <a
                href={NPM_URL}
                className="text-xs font-semibold tracking-widest text-muted-foreground uppercase hover:text-foreground"
                rel="noreferrer"
                target="_blank"
              >
                npm
              </a>
              <a
                href={GITHUB_URL}
                className="text-xs font-semibold tracking-widest text-muted-foreground uppercase hover:text-foreground"
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
              <ThemeToggle />
            </div>
          </div>
          <TabsNav aria-label="Site" className="w-full overflow-x-auto">
            {primaryNav.map((item) => {
              const active = navItemIsActive(item.href, pathname)
              return (
                <InternalLink
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  data-state={active ? "active" : "inactive"}
                  className={cn(tabsTriggerVariants(), "px-3 sm:px-4")}
                >
                  {item.label}
                </InternalLink>
              )
            })}
          </TabsNav>
        </div>
      </header>
      <main
        id="main"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6"
      >
        {children}
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <p>Atlas React Kit · MIT</p>
          <p>Press D to toggle theme</p>
        </div>
      </footer>
    </div>
  )
}
