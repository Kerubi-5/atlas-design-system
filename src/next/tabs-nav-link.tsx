"use client"

import type * as React from "react"
import Link from "next/link.js"

import { cn } from "../utils.js"
import { tabsTriggerVariants } from "../internal/tabs-styles.js"

function TabsNavLink({
  active,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { active: boolean }) {
  return (
    <Link
      data-slot="tabs-nav-link"
      // data-state reuses the trigger's active styles; aria-current is what
      // assistive tech reads.
      data-state={active ? "active" : "inactive"}
      aria-current={active ? "page" : undefined}
      className={cn(tabsTriggerVariants(), className)}
      {...props}
    />
  )
}

export { TabsNavLink }
