import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { buttonVariants } from "./button.js"
import { ariaDisabledState, selectedState } from "./internal/styles.js"
import { cn } from "./utils.js"

/**
 * Page links for long lists and tables. Links are plain anchors so the page
 * lives in the URL; pass `onClick` with `href` for client-side routing.
 * The nav fills its container (it measures that width to drop pages that no
 * longer fit, keeping the first, last and current pages while it can): place
 * its links with `className` (`justify-center`, `justify-end`) to suit the
 * layout.
 */
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn("@container/pagination flex w-full min-w-0", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row flex-wrap items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  /** This link is the current page: `aria-current="page"` and the selected wash. */
  isActive?: boolean
  /** `icon` (default) is a square page number; `default` fits text such as Previous. */
  size?: "default" | "icon"
  /**
   * No page to go to, such as Previous on the first page. Renders without
   * `href`, announced as a disabled link and dimmed.
   */
  disabled?: boolean
} & React.ComponentProps<"a">

/** The current page gets `aria-current="page"` and the selected wash. */
function PaginationLink({
  className,
  isActive,
  size = "icon",
  disabled,
  href,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      href={disabled ? undefined : href}
      role={disabled ? "link" : undefined}
      aria-disabled={disabled || undefined}
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size: size === "icon" ? "icon-sm" : "sm",
        }),
        selectedState.current,
        ariaDisabledState,
        "font-medium tracking-normal normal-case tabular-nums",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      // Custom (e.g. translated) text names the link itself (WCAG 2.5.3).
      aria-label={children == null ? "Go to previous page" : undefined}
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="sr-only sm:not-sr-only">{children ?? "Previous"}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      // Custom (e.g. translated) text names the link itself (WCAG 2.5.3).
      aria-label={children == null ? "Go to next page" : undefined}
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2", className)}
      {...props}
    >
      <span className="sr-only sm:not-sr-only">{children ?? "Next"}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center text-muted-foreground",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
