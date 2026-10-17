"use client"

import * as React from "react"
import { format } from "date-fns"

import { LazyCalendar } from "./lazy-calendar.js"
import {
  PickerClearFooter,
  PickerShell,
  limitCalendarProps,
  type PickerTriggerProps,
} from "./picker-shell.js"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select.js"

/** Default clock increment, in minutes. Must divide 60. */
export const DEFAULT_TIME_STEP = 15

export type DateTimePickerButtonProps = PickerTriggerProps & {
  /** Controlled instant. `null` or omitted is empty. */
  value?: Date | null
  /** Called with the picked instant, or `null` on Clear. */
  onValueChange?: (date: Date | null) => void
  /** @deprecated Use `onValueChange`; `onChange` keeps working until 2.0. */
  onChange?: (date: Date | null) => void
  /**
   * Minute increment for the time selects (1, 5, 15, 30, or 60).
   * Values that do not divide 60 fall back to 15 so the list stays even.
   */
  timeStep?: number
}

/**
 * Normalize a minute step so option lists stay even (1, 5, 15, 30, 60).
 * Invalid values fall back to 15 so a bad prop cannot empty the minute list.
 */
export function resolveTimeStep(step: number | undefined): number {
  if (step == null) return DEFAULT_TIME_STEP
  if (!Number.isInteger(step) || step <= 0 || step > 60 || 60 % step !== 0) {
    return DEFAULT_TIME_STEP
  }
  return step
}

/** Two-digit clock fragment (`00`–`23` / `00`–`59`). */
function padTimePart(value: number): string {
  return String(value).padStart(2, "0")
}

/**
 * Build a local Date from a calendar day and a clock time.
 * Seconds and milliseconds stay zero so a stepped minute remains exact.
 */
function combineDateAndTime(day: Date, hours: number, minutes: number): Date {
  const next = new Date(day)
  next.setHours(hours, minutes, 0, 0)
  return next
}

/**
 * Minute options for `timeStep`, plus the current minute when it is off-step
 * so a loaded value such as 14:07 still appears in the select.
 */
function minuteOptions(step: number, current?: number): number[] {
  const minutes: number[] = []
  for (let minute = 0; minute < 60; minute += step) {
    minutes.push(minute)
  }
  if (current != null && !minutes.includes(current)) {
    minutes.push(current)
    minutes.sort((a, b) => a - b)
  }
  return minutes
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => padTimePart(hour))

/**
 * Keep the date-time popover open when a portaled Select option is clicked.
 * Select content renders outside the popover, so Radix would otherwise treat
 * that pointer down as an outside dismiss.
 */
function preventDismissForPortaledSelect(event: {
  target: EventTarget | null
  preventDefault: () => void
}) {
  const target = event.target
  if (
    target instanceof Element &&
    target.closest("[data-slot=select-content]")
  ) {
    event.preventDefault()
  }
}

/**
 * Calendar plus hour/minute popover trigger styled as a form control (same
 * chrome as Input, SelectTrigger, and DatePickerButton). `value` is a `Date`
 * or `null`. Picking a day keeps the popover open so the time can be set;
 * Clear emits `null`. One month only, clamped to the viewport, so the panel
 * stays on-screen at a 390px width. `className` styles the trigger,
 * `contentClassName` the popover, and `calendarProps` reaches Day Picker.
 */
export function DateTimePickerButton({
  value,
  onValueChange,
  onChange,
  timeStep,
  placeholder = "Pick a date and time",
  defaultMonth,
  calendarProps,
  minDate,
  maxDate,
  ...shell
}: DateTimePickerButtonProps) {
  const [open, setOpen] = React.useState(false)
  const emit = onValueChange ?? onChange
  const date = value ?? null
  const step = resolveTimeStep(timeStep)
  const empty = date == null
  const hourId = React.useId()
  const minuteId = React.useId()

  return (
    <PickerShell
      {...shell}
      empty={empty}
      label={date ? format(date, "PPP p") : placeholder}
      dialogLabel="Choose date and time"
      open={open}
      onOpenChange={setOpen}
      onInteractOutside={preventDismissForPortaledSelect}
    >
      <LazyCalendar
        {...limitCalendarProps(calendarProps, minDate, maxDate)}
        mode="single"
        autoFocus
        selected={date ?? undefined}
        defaultMonth={defaultMonth ?? date ?? undefined}
        onSelect={(next) => {
          // Re-clicking a selected day would clear it; require Clear instead
          // so a time already set is not dropped by an accidental second tap.
          if (!next) return
          emit?.(
            combineDateAndTime(
              next,
              date?.getHours() ?? 0,
              date?.getMinutes() ?? 0
            )
          )
        }}
      />
      <div
        role="group"
        aria-label="Time"
        data-slot="date-time-picker-time"
        className="flex min-w-0 flex-col gap-2 border-t p-3"
      >
        <p className="text-xs font-semibold tracking-wide uppercase">Time</p>
        <div className="flex min-w-0 items-center gap-2">
          <Select
            value={date ? padTimePart(date.getHours()) : undefined}
            onValueChange={(nextHour) => {
              if (!date) return
              emit?.(
                combineDateAndTime(date, Number(nextHour), date.getMinutes())
              )
            }}
            disabled={empty}
          >
            <SelectTrigger
              id={hourId}
              aria-label="Hour"
              className="min-w-0 flex-1"
            >
              <SelectValue placeholder="––" />
            </SelectTrigger>
            <SelectContent>
              {HOUR_OPTIONS.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground" aria-hidden="true">
            :
          </span>
          <Select
            value={date ? padTimePart(date.getMinutes()) : undefined}
            onValueChange={(nextMinute) => {
              if (!date) return
              emit?.(
                combineDateAndTime(date, date.getHours(), Number(nextMinute))
              )
            }}
            disabled={empty}
          >
            <SelectTrigger
              id={minuteId}
              aria-label="Minute"
              className="min-w-0 flex-1"
            >
              <SelectValue placeholder="––" />
            </SelectTrigger>
            <SelectContent>
              {minuteOptions(step, date?.getMinutes()).map((minute) => {
                const value = padTimePart(minute)
                return (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      <PickerClearFooter
        disabled={empty}
        onClear={() => {
          emit?.(null)
          setOpen(false)
        }}
      />
    </PickerShell>
  )
}
