"use client"

import type { ComponentProps } from "react"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
} from "lucide-react"

import { TableHead } from "./table.js"
import { cn } from "./utils.js"

export type SortDirection = "asc" | "desc"

type SortableTableHeadProps = ComponentProps<typeof TableHead> & {
  /** Whether this column is the active sort key. */
  sorted?: boolean
  /** Sort order shown while `sorted`. Default `asc`. */
  direction?: SortDirection
  /** Called when the header button is pressed, e.g. to toggle the sort. */
  onClick?: () => void
  /** Classes for the inner sort button (`data-slot="sortable-table-head-button"`). */
  buttonClassName?: string
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
  buttonClassName,
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
        data-slot="sortable-table-head-button"
        className={cn(
          "inline-flex items-center gap-1 rounded-none hover:text-foreground",
          buttonClassName
        )}
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
            className="size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </button>
    </TableHead>
  )
}
