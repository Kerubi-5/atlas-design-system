"use client"

import type * as React from "react"
import Link from "next/link.js"

import { NavLink as BaseNavLink } from "../nav-link.js"

/**
 * Next.js adapter for the shell `NavLink` pill: the base `NavLink` with
 * `asChild` around a Next `Link`, so it renders the same element. Same
 * contract as `TabsNavLink`: Next `Link` props plus a required `active`
 * boolean. The kit still does not read the router; the app passes `active`,
 * usually `active={isNavActive(usePathname(), href)}` with `isNavActive`
 * from `atlas-react-kit/nav-link`.
 */
function NavLink({
  active,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { active: boolean }) {
  return (
    <BaseNavLink asChild active={active} className={className}>
      <Link {...props} />
    </BaseNavLink>
  )
}

export { NavLink }
