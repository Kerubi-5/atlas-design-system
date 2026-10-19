"use client"

import type * as React from "react"
import Link from "next/link.js"

import { TabsNavLink as BaseTabsNavLink } from "../tabs.js"

/**
 * Next.js adapter for `TabsNavLink`: the base link with `asChild` around a
 * Next `Link`, so it renders the same element. Next `Link` props plus a
 * required `active` boolean (`isNavActive(usePathname(), href)` from
 * `atlas-react-kit/nav-link` works here too).
 */
function TabsNavLink({
  active,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { active: boolean }) {
  return (
    <BaseTabsNavLink asChild active={active} className={className}>
      <Link {...props} />
    </BaseTabsNavLink>
  )
}

export { TabsNavLink }
