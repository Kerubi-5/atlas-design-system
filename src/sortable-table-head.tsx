"use client"

import type { ComponentProps } from "react"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
} from "lucide-react"

import { TableHead } from "./table.js"

export type SortDirection = "asc" | "desc"

type SortableTableHeadProps = ComponentProps<typeof TableHead> & {
  /** Whether this column is the active sort key. */
  sorted?: boolean
  direction?: SortDirection
  onClick?: () => void
}

/**
 * Table header cell with `aria-sort` and a button affordance.
 * Column keys and comparators stay in the application.
 */
export function SortableTableHead({
  children,
  sorted = false,
  direction = "asc",
  onClick,
  className,
  ...props
}: SortableTableHeadProps) {
  const ariaSort = sorted
    ? direction === "asc"
      ? "ascending"
      : "descending"
    : "none"

  return (
    <TableHead aria-sort={ariaSort} className={className} {...props}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded-none hover:text-foreground"
      >
        {children}
        {sorted ? (
          direction === "asc" ? (
            <ChevronUpIcon className="size-3.5" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="size-3.5" aria-hidden="true" />
          )
        ) : (
          <ChevronsUpDownIcon
            className="size-3.5 opacity-40"
            aria-hidden="true"
          />
        )}
      </button>
    </TableHead>
  )
}
