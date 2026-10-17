import type * as React from "react"

import { cn } from "./utils.js"

/**
 * A page's title row: the heading, an optional hint, anything else that
 * belongs under them (badges, meta), and actions on the right. Stacks on
 * small screens.
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
  /** Buttons or links on the right (stacked below on small screens). */
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
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between",
        className
      )}
      {...props}
    >
      <div
        data-slot="page-header-heading"
        className="flex min-w-0 flex-col gap-1"
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
          className="flex flex-wrap items-center gap-2"
        >
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export { PageHeader }
