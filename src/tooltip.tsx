"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import {
  OVERLAY_SIDE_OFFSET,
  overlaySideSlide,
} from "./internal/overlay-styles.js"
import { cn } from "./utils.js"

/** True inside a TooltipProvider, so `Tooltip` does not add its own. */
const HasTooltipProvider = React.createContext(false)

/**
 * Shares open delay across tooltips. `Tooltip` adds one when none is above
 * it, so a provider at the app root is optional; add it to tune
 * `delayDuration`.
 */
function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <HasTooltipProvider.Provider value={true}>
      <TooltipPrimitive.Provider
        data-slot="tooltip-provider"
        delayDuration={delayDuration}
        {...props}
      />
    </HasTooltipProvider.Provider>
  )
}

/**
 * Short label for an icon button or truncated text. Opens on hover and
 * keyboard focus; put essential information in visible text instead.
 */
function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />
  // A nested provider would override the app's delayDuration.
  if (React.useContext(HasTooltipProvider)) return root
  return <TooltipProvider>{root}</TooltipProvider>
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  arrowClassName,
  sideOffset = OVERLAY_SIDE_OFFSET,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  /** Classes for the arrow, e.g. its fill when `className` recolors the tip. */
  arrowClassName?: string
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          overlaySideSlide,
          // Radix tooltips open as "delayed-open" or "instant-open", which
          // the shared data-open fade does not match.
          "z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-none bg-foreground px-3 py-1.5 text-xs text-balance text-background duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          data-slot="tooltip-arrow"
          className={cn("fill-foreground", arrowClassName)}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
