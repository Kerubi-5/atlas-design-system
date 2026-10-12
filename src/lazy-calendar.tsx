"use client"

import * as React from "react"

import { Spinner } from "./spinner.js"

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

export function LazyCalendar(
  props: React.ComponentProps<typeof LazyCalendarInner>
) {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-72 w-64 items-center justify-center">
          <Spinner aria-label="Loading calendar" />
        </div>
      }
    >
      <LazyCalendarInner {...props} />
    </React.Suspense>
  )
}
