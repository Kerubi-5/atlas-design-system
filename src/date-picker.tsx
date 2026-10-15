"use client"

import * as React from "react"
import { format, isSameDay } from "date-fns"
import type { DateRange } from "react-day-picker"

import { toDate, type DateLike } from "./internal/date-like.js"
import { MD_MEDIA_QUERY, useMediaQuery } from "./internal/use-media-query.js"
import { LazyCalendar } from "./lazy-calendar.js"
import {
  PickerClearFooter,
  PickerShell,
  limitCalendarProps,
  type PickerCalendarProps,
  type PickerTriggerProps,
} from "./picker-shell.js"

export type { DateRange }
export type { DateLike }
export { toDate }

/** From/to value for `DatePickerButton` in range mode; each side is `DateLike`. */
export type DatePickerRangeValue = {
  from?: DateLike
  to?: DateLike
}

/** Format a Date as a timezone-safe calendar date (`yyyy-MM-dd`). */
export function formatLocalDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export type { PickerCalendarProps as DatePickerCalendarProps }

type DatePickerSharedProps = PickerTriggerProps & {
  /**
   * Visible months in the popover calendar. Defaults to 1 in single mode.
   * In range mode, defaults to 1 below the `md` breakpoint and 2 at `md`
   * and above so two stacked months do not open off-screen on mobile.
   */
  numberOfMonths?: number
}

export type DatePickerSingleProps = DatePickerSharedProps & {
  mode?: "single"
  value?: DateLike
  onChange: (date: Date | undefined) => void
}

export type DatePickerRangeProps = DatePickerSharedProps & {
  mode: "range"
  value?: DatePickerRangeValue
  onChange: (range: DateRange | undefined) => void
}

export type DatePickerButtonProps = DatePickerSingleProps | DatePickerRangeProps

/**
 * Trigger label for a range: one PPP date while the end is missing or the
 * same day as the start, otherwise `from – to`.
 */
function formatRangeTriggerLabel(
  from: Date | undefined,
  to: Date | undefined,
  placeholder: string
) {
  if (!from) return placeholder
  if (!to || isSameDay(from, to)) return format(from, "PPP")
  return `${format(from, "PPP")} – ${format(to, "PPP")}`
}

function DatePickerSingleButton({
  value,
  onChange,
  placeholder = "Pick a date",
  numberOfMonths,
  defaultMonth,
  calendarProps,
  minDate,
  maxDate,
  ...shell
}: DatePickerSingleProps) {
  const [open, setOpen] = React.useState(false)
  const date = toDate(value)

  return (
    <PickerShell
      {...shell}
      empty={!date}
      label={date ? format(date, "PPP") : placeholder}
      dialogLabel="Choose date"
      open={open}
      onOpenChange={setOpen}
    >
      <LazyCalendar
        {...limitCalendarProps(calendarProps, minDate, maxDate)}
        mode="single"
        autoFocus
        selected={date}
        defaultMonth={defaultMonth ?? date}
        numberOfMonths={numberOfMonths}
        onSelect={(next) => {
          onChange(next)
          setOpen(false)
        }}
      />
    </PickerShell>
  )
}

function DatePickerRangeButton({
  value,
  onChange,
  placeholder = "Pick a date range",
  numberOfMonths,
  defaultMonth,
  calendarProps,
  minDate,
  maxDate,
  ...shell
}: DatePickerRangeProps) {
  const [open, setOpen] = React.useState(false)
  const mdUp = useMediaQuery(MD_MEDIA_QUERY)
  const months = numberOfMonths ?? (mdUp ? 2 : 1)
  const from = toDate(value?.from)
  const to = toDate(value?.to)
  const selected: DateRange | undefined = from || to ? { from, to } : undefined
  // Opening on a complete range means the next click starts a new one.
  // Without this, Day Picker extends the old range and the popover closes
  // on that first click, so a fresh range needs Clear first.
  const restartRef = React.useRef(false)

  const onOpenChange = (next: boolean) => {
    if (next) restartRef.current = Boolean(from && to)
    setOpen(next)
  }

  return (
    <PickerShell
      {...shell}
      empty={!from}
      label={formatRangeTriggerLabel(from, to, placeholder)}
      dialogLabel="Choose dates"
      open={open}
      onOpenChange={onOpenChange}
    >
      <LazyCalendar
        {...limitCalendarProps(calendarProps, minDate, maxDate)}
        mode="range"
        autoFocus
        selected={selected}
        defaultMonth={defaultMonth ?? from ?? to}
        numberOfMonths={months}
        onSelect={(next, day) => {
          const range = restartRef.current ? { from: day, to: day } : next
          restartRef.current = false
          onChange(range)
          // First click is a same-day range; keep the popover open so the
          // user can set `to`. Close once the ends differ.
          if (range?.from && range.to && !isSameDay(range.from, range.to)) {
            setOpen(false)
          }
        }}
      />
      <PickerClearFooter
        disabled={!from && !to}
        onClear={() => {
          onChange(undefined)
          setOpen(false)
        }}
      />
    </PickerShell>
  )
}

/**
 * Calendar popover trigger styled as a form control (same chrome as Input
 * and SelectTrigger). `mode="single"` (default) accepts `Date` or
 * `yyyy-MM-dd` and emits `Date | undefined`. `mode="range"` accepts
 * `{ from, to }` and emits `DateRange | undefined`. Range mode shows one
 * month below `md` and two at `md+` unless `numberOfMonths` is set. The
 * popover clamps to the viewport (`side` is overridable). `className` styles
 * the trigger, `contentClassName` the popover, and `calendarProps` reaches
 * Day Picker (disabled days, `startMonth`, `weekStartsOn`, `locale`). Square
 * corners follow the shared shape rules.
 */
export function DatePickerButton(props: DatePickerButtonProps) {
  if (props.mode === "range") {
    return <DatePickerRangeButton {...props} />
  }
  return <DatePickerSingleButton {...props} />
}
