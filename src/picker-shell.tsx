"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import type { Locale } from "date-fns"

import { Button } from "./button.js"
import {
  toDate,
  type DateLike,
  type DateMatcher,
} from "./internal/date-like.js"
import {
  PICKER_COLLISION_PADDING,
  pickerContentClassName,
  pickerTriggerClassName,
  pickerValueId,
} from "./internal/form-control.js"
import { preloadCalendar } from "./lazy-calendar.js"
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js"
import { cn } from "./utils.js"

/**
 * Not a public entry. The trigger, popover, and Clear footer that
 * `DatePickerButton` and `DateTimePickerButton` share.
 */

/**
 * Options for the picker's calendar. The picker owns the selection, focus,
 * and month props; these are the kit's own types, so a Day Picker upgrade
 * does not change them.
 */
export type PickerCalendarProps = {
  /** Days that cannot be picked. */
  disabled?: DateMatcher | DateMatcher[]
  /** Days left out of the grid. */
  hidden?: DateMatcher | DateMatcher[]
  /** Earliest month the calendar pages to. */
  startMonth?: Date
  /** Latest month the calendar pages to. */
  endMonth?: Date
  /** First day of the week, `0` (Sunday) to `6`. Defaults to the locale's. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** A date-fns locale for month and weekday names. */
  locale?: Locale
  /** Show the leading and trailing days of the neighbouring months. Default `true`. */
  showOutsideDays?: boolean
  /** Always show six weeks, so the popover height does not change. */
  fixedWeeks?: boolean
  /** Show ISO or locale week numbers in a first column. */
  showWeekNumber?: boolean
  /** Month and year as text (`label`, default) or as dropdowns. */
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
  /** The day marked as today. Defaults to the current date. */
  today?: Date
  /** Classes for the calendar root. */
  className?: string
}

/** Props both pickers take for their trigger and popover. */
export type PickerTriggerProps = {
  /** Id of the trigger button; the trigger text gets `${id}-value`. */
  id?: string
  /**
   * Trigger text while nothing is picked. Defaults to "Pick a date", "Pick a
   * date range", or "Pick a date and time" depending on the picker.
   */
  placeholder?: string
  /** Disable the trigger so the popover cannot open. */
  disabled?: boolean
  /** Classes for the trigger button. */
  className?: string
  /** Classes for the popover content, e.g. a width such as `w-80`. */
  contentClassName?: string
  /** Mark the trigger invalid, e.g. when its field has an error. */
  "aria-invalid"?: boolean
  /**
   * Forwarded to the trigger. To name it from a visible label while still
   * reading the picked value, list the label's id and then `${id}-value`
   * (the trigger text). A `<label for>` alone names the button by the label
   * and drops the value; it can stay for click-to-open.
   */
  "aria-labelledby"?: string
  /** Forwarded to the trigger, e.g. the id of a hint or error text. */
  "aria-describedby"?: string
  /** Popover side. Defaults to `bottom`; Radix still flips on collision. */
  side?: React.ComponentProps<typeof PopoverContent>["side"]
  /** Month shown when the popover opens; falls back to the selected date. */
  defaultMonth?: Date
  /**
   * Earliest day that can be picked. Earlier days are disabled and the
   * calendar does not page before its month.
   */
  minDate?: DateLike
  /**
   * Latest day that can be picked. Later days are disabled and the calendar
   * does not page past its month.
   */
  maxDate?: DateLike
  /** Day Picker options passed through to the calendar. */
  calendarProps?: PickerCalendarProps
}

/**
 * `calendarProps` with `minDate` / `maxDate` applied: days outside them join
 * any `disabled` matchers, and they bound paging unless `startMonth` /
 * `endMonth` are set.
 */
export function limitCalendarProps(
  calendarProps: PickerCalendarProps | undefined,
  minDate: DateLike,
  maxDate: DateLike
): PickerCalendarProps | undefined {
  const min = toDate(minDate)
  const max = toDate(maxDate)
  if (!min && !max) return calendarProps
  const disabled = calendarProps?.disabled
  const matchers: DateMatcher[] = [
    ...(disabled === undefined
      ? []
      : Array.isArray(disabled)
        ? disabled
        : [disabled]),
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
  ]
  return {
    ...calendarProps,
    disabled: matchers,
    startMonth: calendarProps?.startMonth ?? min,
    endMonth: calendarProps?.endMonth ?? max,
  }
}

type PickerShellProps = Omit<
  PickerTriggerProps,
  "placeholder" | "defaultMonth" | "calendarProps" | "minDate" | "maxDate"
> & {
  /** Muted trigger text while nothing is picked. */
  empty: boolean
  /** Trigger text: the formatted value or the placeholder. */
  label: string
  /** Accessible name of the popover dialog. */
  dialogLabel: string
  /** Whether the popover is open. */
  open: boolean
  /** Called when the popover opens or closes. */
  onOpenChange: (open: boolean) => void
  /** Called on a pointer down or focus outside the popover; can prevent the dismiss. */
  onInteractOutside?: React.ComponentProps<
    typeof PopoverContent
  >["onInteractOutside"]
  children: React.ReactNode
}

/** Form-control trigger plus the viewport-clamped calendar popover. */
export function PickerShell({
  id,
  disabled,
  className,
  contentClassName,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  side,
  empty,
  label,
  dialogLabel,
  open,
  onOpenChange,
  onInteractOutside,
  children,
}: PickerShellProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          data-empty={empty}
          className={cn(pickerTriggerClassName, className)}
          onPointerEnter={preloadCalendar}
          onFocus={preloadCalendar}
        >
          <CalendarIcon data-icon="inline-start" />
          <span
            data-slot="date-picker-value"
            className="min-w-0 text-left whitespace-normal"
            id={id ? pickerValueId(id) : undefined}
          >
            {label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side={side}
        collisionPadding={PICKER_COLLISION_PADDING}
        aria-label={dialogLabel}
        // The calendar's `autoFocus` puts focus on the selected day (or
        // today) once it loads, as the APG date picker dialog does; Radix
        // focusing the popover first would leave it on the container.
        onOpenAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={onInteractOutside}
        className={cn(
          "w-auto min-w-0",
          pickerContentClassName,
          contentClassName
        )}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

/** Clear button row under the calendar. */
export function PickerClearFooter({
  disabled,
  onClear,
}: {
  /** Disable the Clear button, e.g. while nothing is picked. */
  disabled: boolean
  /** Called when Clear is pressed. */
  onClear: () => void
}) {
  return (
    <div
      data-slot="date-picker-footer"
      className="flex justify-end border-t p-2"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  )
}
