import * as React from "react"
import { cva } from "class-variance-authority"
import { Slot } from "radix-ui"

import { activeLinkAttributes } from "./internal/active-link.js"
import type { AsChildProps } from "./internal/as-child.js"
import { focusRing, selectedState } from "./internal/styles.js"
import { cn } from "./utils.js"

/**
 * Pill chrome for app-shell navigation. Inactive is muted text with an
 * accent hover; active uses the shared selected wash, text, and border
 * (`selectedState.active`) so the current page meets non-text contrast.
 * Apps pass `active` — the kit has no router.
 */
const navLinkVariants = cva([
  focusRing,
  selectedState.active,
  "inline-flex items-center gap-1.5 rounded-none border border-transparent px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent data-[state=active]:font-medium",
])

/**
 * Whether `href` is the current page for a nav link: the path itself, or a
 * page under it (`/tasks` is active on `/tasks/42`, not on `/tasks-archive`).
 * The kit has no router, so the app passes the pathname:
 * `active={isNavActive(pathname, href)}`.
 */
function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Pill link for app-shell destinations (Calendar, Tasks, Settings). Pass
 * `active` from the route (`isNavActive` compares a pathname with the
 * link's `href`); the kit does not read the URL. `asChild` wraps a router
 * `Link` with these styles, the same Slot pattern as `BreadcrumbLink`.
 *
 * Not a tab: in-page view switches that belong in the URL use `TabsNav`
 * and `TabsNavLink`. Next apps can import the optional adapter
 * from `atlas-react-kit/next/nav-link` instead of composing `asChild`.
 */
function NavLink({
  asChild,
  active,
  className,
  ...props
}: React.ComponentProps<"a"> &
  AsChildProps & {
    /** This link is the current page: `aria-current="page"` and the selected chrome. */
    active: boolean
  }) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="nav-link"
      {...activeLinkAttributes(active)}
      className={cn(navLinkVariants(), className)}
      {...props}
    />
  )
}

export { NavLink, isNavActive, navLinkVariants }
