"use client"

import * as React from "react"
import { format, isSameDay } from "date-fns"

import {
  toDate,
  type DateLike,
  type DateMatcher,
  type DateRange,
} from "./internal/date-like.js"
import { MD_MEDIA_QUERY, useMediaQuery } from "./internal/use-media-query.js"
import { LazyCalendar } from "./lazy-calendar.js"
import {
  PickerClearFooter,
  PickerShell,
  limitCalendarProps,
  type PickerCalendarProps,
  type PickerTriggerProps,
} from "./picker-shell.js"

export type { DateLike, DateMatcher, DateRange }
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
  /** Called with the picked day, or `undefined` on Clear. */
  onValueChange?: (date: Date | undefined) => void
  /** @deprecated Use `onValueChange`; `onChange` keeps working until 2.0. */
  onChange?: (date: Date | undefined) => void
}

export type DatePickerRangeProps = DatePickerSharedProps & {
  mode: "range"
  value?: DatePickerRangeValue
  /** Called on every range click, or with `undefined` on Clear. */
  onValueChange?: (range: DateRange | undefined) => void
  /** @deprecated Use `onValueChange`; `onChange` keeps working until 2.0. */
  onChange?: (range: DateRange | undefined) => void
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
  onValueChange,
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
  const emit = onValueChange ?? onChange
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
          emit?.(next)
          setOpen(false)
        }}
      />
    </PickerShell>
  )
}

function DatePickerRangeButton({
  value,
  onValueChange,
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
  const emit = onValueChange ?? onChange
  const mdUp = useMediaQuery(MD_MEDIA_QUERY)
  const months = numberOfMonths ?? (mdUp ? 2 : 1)
  const from = toDate(value?.from)
  const to = toDate(value?.to)
  const selected: DateRange | undefined = from || to ? { from, to } : undefined

  return (
    <PickerShell
      {...shell}
      empty={!from}
      label={formatRangeTriggerLabel(from, to, placeholder)}
      dialogLabel="Choose dates"
      open={open}
      onOpenChange={setOpen}
    >
      <LazyCalendar
        {...limitCalendarProps(calendarProps, minDate, maxDate)}
        mode="range"
        // A click on a complete range (or on none) starts a new one, so a
        // fresh range never needs Clear first. The start emits `to: undefined`.
        resetOnSelect
        autoFocus
        selected={selected}
        defaultMonth={defaultMonth ?? from ?? to}
        numberOfMonths={months}
        onSelect={(range) => {
          emit?.(range)
          // Close once the ends differ; a start or a one-day range stays open.
          if (range?.from && range.to && !isSameDay(range.from, range.to)) {
            setOpen(false)
          }
        }}
      />
      <PickerClearFooter
        disabled={!from && !to}
        onClear={() => {
          emit?.(undefined)
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
