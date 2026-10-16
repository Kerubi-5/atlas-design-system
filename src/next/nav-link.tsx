"use client"

import type * as React from "react"
import Link from "next/link.js"

import { navLinkVariants } from "../nav-link.js"
import { cn } from "../utils.js"

/**
 * Next.js adapter for the shell `NavLink` pill. Same contract as
 * `TabsNavLink`: Next `Link` props plus a required `active` boolean. The
 * kit still does not read the router; the app passes `active`.
 */
function NavLink({
  active,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { active: boolean }) {
  return (
    <Link
      data-slot="nav-link"
      // data-state reuses the pill's active styles; aria-current is what
      // assistive tech reads.
      data-state={active ? "active" : "inactive"}
      aria-current={active ? "page" : undefined}
      className={cn(navLinkVariants(), className)}
      {...props}
    />
  )
}

export { NavLink }
