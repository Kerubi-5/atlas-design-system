import type * as React from "react"

import { cn } from "./utils.js"

/**
 * A page's title row: the heading, an optional hint, anything else that
 * belongs under them (badges, meta), and actions on the trailing edge.
 * Stacks on small screens; from `sm` up the actions stay beside the title
 * even when the heading wraps.
 */
function PageHeader({
  title,
  description,
  actions,
  titleAs: Title = "h1",
  titleClassName,
  className,
  children,
  ...props
}: {
  /** The page heading. */
  title: React.ReactNode
  /** Muted hint under the title. */
  description?: React.ReactNode
  /** Buttons or links on the trailing edge (stacked below on small screens). */
  actions?: React.ReactNode
  /** Heading level. Default `h1`. */
  titleAs?: "h1" | "h2" | "h3"
  /** Classes for the heading. */
  titleClassName?: string
} & Omit<React.ComponentProps<"header">, "title">) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-start sm:justify-between",
        className
      )}
      {...props}
    >
      <div
        data-slot="page-header-heading"
        className="flex min-w-0 flex-1 flex-col gap-1"
      >
        <Title
          data-slot="page-header-title"
          className={cn(
            "text-2xl font-semibold tracking-tight",
            titleClassName
          )}
        >
          {title}
        </Title>
        {description ? (
          <p
            data-slot="page-header-description"
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        ) : null}
        {children}
      </div>
      {actions ? (
        <div
          data-slot="page-header-actions"
          className="flex shrink-0 flex-wrap items-center gap-2"
        >
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export { PageHeader }
