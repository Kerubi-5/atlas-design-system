"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { focusRing } from "./internal/styles.js"
import {
  tabsListVariants,
  tabsScrollerVariants,
  tabsTriggerVariants,
} from "./internal/tabs-styles.js"
import { useHorizontalOverflow } from "./internal/use-horizontal-overflow.js"
import { cn } from "./utils.js"

type Orientation = "horizontal" | "vertical"

/**
 * The root's orientation, so the list can pick plain size classes (`h-11`)
 * that a consumer `className` replaces, instead of `group-data-*` variants
 * that would beat it.
 */
const TabsOrientationContext = React.createContext<Orientation>("horizontal")

/** Props `TabsList` and `TabsNav` share for the scroller around their row. */
type TabsScrollerClassNameProps = {
  /** Classes for the scroller around the tab row (`h-13` with `p-1` by default). */
  scrollerClassName?: string
}

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsOrientationContext.Provider value={orientation}>
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
    </TabsOrientationContext.Provider>
  )
}

/**
 * Horizontal scroller around a tab row. `overflow-x: auto` alone would
 * compute `overflow-y` to `auto` as well (CSS overflow pairing), so the
 * active tab's border and focus ring grow a vertical scrollbar. Pad for
 * those strokes *inside* the box (`h-13` = `h-11` list + `p-1`), clip the
 * y axis as a backstop, and fade the edges while the row overflows —
 * same cue as `Table`.
 */
function TabsScroller({
  variant = "default",
  orientation = "horizontal",
  className,
  children,
}: {
  /** Matches the list's variant so the scroller fill fits. Default `default`. */
  variant?: "default" | "line"
  /** Matches the root's orientation. Default `horizontal`. */
  orientation?: Orientation
  /** Classes for the scroller. */
  className?: string
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const revealed = React.useRef<HTMLElement | null>(null)
  const overflowing = useHorizontalOverflow(ref)

  // Runs after every render, not just mount: TabsNav usually sits in a
  // persistent layout, so a route change updates the active link in place.
  React.useLayoutEffect(() => {
    const scroller = ref.current
    if (!scroller) return
    const active = scroller.querySelector<HTMLElement>(
      '[aria-current="page"], [data-state="active"]'
    )
    if (!active || active === revealed.current) return
    revealed.current = active
    active.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "auto",
    })
  })

  return (
    <div
      ref={ref}
      data-slot="tabs-scroller"
      data-variant={variant}
      tabIndex={overflowing ? 0 : undefined}
      className={cn(
        focusRing,
        tabsScrollerVariants({ variant, orientation }),
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * The tab row inside its scroller. `className` styles the list (its `h-11`
 * height, fill, gap); `scrollerClassName` styles the scroller around it
 * (`h-13` with `p-1` for the active border and focus ring).
 */
function TabsList({
  className,
  scrollerClassName,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  Omit<VariantProps<typeof tabsListVariants>, "orientation"> &
  TabsScrollerClassNameProps) {
  const orientation = React.useContext(TabsOrientationContext)
  return (
    <TabsScroller
      variant={variant ?? "default"}
      orientation={orientation}
      className={scrollerClassName}
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(
          tabsListVariants({ variant, orientation }),
          // The scroller owns the muted fill so edge fades show through.
          variant === "default" && "bg-transparent",
          className
        )}
        {...props}
      />
    </TabsScroller>
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
      className={cn("flex-1 text-sm", focusRing, className)}
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
 *
 * Overflow is handled here: the row scrolls horizontally only, with padding
 * for active borders and focus rings counted in the scroller height (so the
 * list cannot overflow on y), an edge fade while it overflows, and the
 * active link scrolled into view on mount. Do not wrap it in
 * `overflow-x-auto`. `scrollerClassName` styles that scroller and
 * `listClassName` the row of links inside it.
 */
function TabsNav({
  className,
  scrollerClassName,
  listClassName,
  children,
  ...props
}: React.ComponentProps<"nav"> &
  TabsScrollerClassNameProps & {
    /** Required accessible name for the nav landmark. */
    "aria-label": string
    /** Classes for the row of links inside the scroller. */
    listClassName?: string
  }) {
  return (
    <nav
      data-slot="tabs-nav"
      data-orientation="horizontal"
      className={cn("group/tabs min-w-0 max-w-full", className)}
      {...props}
    >
      <TabsScroller className={scrollerClassName}>
        <div
          data-slot="tabs-list"
          data-variant="default"
          className={cn(
            tabsListVariants({ orientation: "horizontal" }),
            "bg-transparent",
            listClassName
          )}
        >
          {children}
        </div>
      </TabsScroller>
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
