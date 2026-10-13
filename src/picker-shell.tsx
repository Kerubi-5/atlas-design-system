"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import type { PropsBase } from "react-day-picker"

import { Button } from "./button.js"
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
 * Day Picker options for the picker's calendar: disabled matchers,
 * `startMonth` / `endMonth`, `weekStartsOn`, `locale`, `className`, and so on.
 * The picker owns the selection, focus, and month props.
 */
export type PickerCalendarProps = Omit<
  PropsBase,
  "mode" | "required" | "autoFocus" | "defaultMonth" | "numberOfMonths"
>

/** Props both pickers take for their trigger and popover. */
export type PickerTriggerProps = {
  id?: string
  placeholder?: string
  disabled?: boolean
  /** Classes for the trigger button. */
  className?: string
  /** Classes for the popover content, e.g. a width such as `w-80`. */
  contentClassName?: string
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
  /** Day Picker options passed through to the calendar. */
  calendarProps?: PickerCalendarProps
}

type PickerShellProps = Omit<
  PickerTriggerProps,
  "placeholder" | "defaultMonth" | "calendarProps"
> & {
  /** Muted trigger text while nothing is picked. */
  empty: boolean
  /** Trigger text: the formatted value or the placeholder. */
  label: string
  /** Accessible name of the popover dialog. */
  dialogLabel: string
  open: boolean
  onOpenChange: (open: boolean) => void
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
  disabled: boolean
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
