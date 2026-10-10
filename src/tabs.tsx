"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "./utils.js"
import {
  tabsListVariants,
  tabsTriggerVariants,
} from "./internal/tabs-styles.js"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        'group/tabs flex gap-2 data-[orientation="horizontal"]:flex-col',
        className
      )}
      {...props}
    />
  )
}

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants(), className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

/**
 * Tab-styled links for a view switcher that changes the URL. Use this, not
 * `Tabs` + `TabsTrigger asChild`, when there are no `TabsContent` panels:
 * tabs would point assistive tech at panels that don't exist. Style each link
 * with `tabsTriggerVariants()` and mark the active one with
 * `data-state="active"` and `aria-current="page"` (the Next adapter
 * `TabsNavLink` does this for you).
 */
function TabsNav({
  className,
  children,
  ...props
}: React.ComponentProps<"nav"> & { "aria-label": string }) {
  return (
    <nav
      data-slot="tabs-nav"
      data-orientation="horizontal"
      className={cn("group/tabs", className)}
      {...props}
    >
      <div
        data-slot="tabs-list"
        data-variant="default"
        className={tabsListVariants()}
      >
        {children}
      </div>
    </nav>
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsNav,
  tabsListVariants,
  tabsTriggerVariants,
}
