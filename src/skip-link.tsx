import type * as React from "react"

import { cn } from "./utils.js"

/**
 * First focusable link on the page: hidden until a keyboard user tabs to
 * it, then it jumps past the navigation to `href` (the main landmark's id).
 */
function SkipLink({
  href = "#main-content",
  className,
  children = "Skip to content",
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="skip-link"
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

export { SkipLink }
