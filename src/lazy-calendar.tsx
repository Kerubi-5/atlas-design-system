"use client"

import * as React from "react"

import { Spinner } from "./spinner.js"
import { cn } from "./utils.js"

/**
 * Calendar for the picker popovers, fetched on first use so a page that only
 * shows the trigger does not download Day Picker. Not a public entry: apps
 * that want an inline calendar import `atlas-react-kit/calendar`.
 */
const loadCalendar = () => import("./calendar.js")

/** Start fetching the calendar early, e.g. when the trigger is hovered. */
export function preloadCalendar() {
  void loadCalendar()
}

const LazyCalendarInner = React.lazy(() =>
  loadCalendar().then((module) => ({ default: module.Calendar }))
)

/**
 * While loading, a placeholder the size of a one-month calendar, measured in
 * the calendar's own `--cell-size` (7 columns plus `p-3`; about 9 cells
 * tall), so the popover does not jump. It takes the calendar's `className`,
 * so a `--cell-size` override sizes both.
 */
const fallbackClassName =
  "flex h-[calc(var(--cell-size)*9)] w-[calc(var(--cell-size)*7+--spacing(6))] items-center justify-center [--cell-size:--spacing(8)]"

export function LazyCalendar(
  props: React.ComponentProps<typeof LazyCalendarInner>
) {
  return (
    <React.Suspense
      fallback={
        <div className={cn(fallbackClassName, props.className)}>
          <Spinner aria-label="Loading calendar" />
        </div>
      }
    >
      <LazyCalendarInner {...props} />
    </React.Suspense>
  )
}
