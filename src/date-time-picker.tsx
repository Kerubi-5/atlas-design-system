"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "./button.js"
import { Calendar } from "./calendar.js"
import { formControlTriggerClassName } from "./internal/form-control.js"
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select.js"
import { cn } from "./utils.js"

/** Default clock increment, in minutes. Must divide 60. */
export const DEFAULT_TIME_STEP = 15

/** Gutter used when the calendar popover collides with the viewport. */
const DATE_TIME_PICKER_COLLISION_PADDING = 16

export type DateTimePickerButtonProps = {
  /** Controlled instant. `null` or omitted is empty. */
  value?: Date | null
  onChange: (date: Date | null) => void
  /**
   * Minute increment for the time selects (1, 5, 15, 30, or 60).
   * Values that do not divide 60 fall back to 15 so the list stays even.
   */
  timeStep?: number
  id?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean
  /** Popover side. Defaults to `bottom`; Radix still flips on collision. */
  side?: React.ComponentProps<typeof PopoverContent>["side"]
  /** Month shown when the popover opens; falls back to the selected date. */
  defaultMonth?: Date
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
 * stays on-screen at a 390px width.
 */
export function DateTimePickerButton({
  id,
  value,
  onChange,
  timeStep,
  placeholder = "Pick a date and time",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  side,
  defaultMonth,
}: DateTimePickerButtonProps) {
  const [open, setOpen] = React.useState(false)
  const date = value ?? null
  const step = resolveTimeStep(timeStep)
  const empty = date == null
  const label = date ? format(date, "PPP p") : placeholder
  const hourId = React.useId()
  const minuteId = React.useId()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          data-empty={empty}
          className={cn(
            formControlTriggerClassName,
            "justify-start data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side={side}
        collisionPadding={DATE_TIME_PICKER_COLLISION_PADDING}
        onInteractOutside={preventDismissForPortaledSelect}
        className="w-auto min-w-0 max-w-[min(100vw-2rem,24rem)] max-h-(--radix-popover-content-available-height) overflow-y-auto rounded-none p-0"
      >
        <Calendar
          mode="single"
          selected={date ?? undefined}
          defaultMonth={defaultMonth ?? date ?? undefined}
          onSelect={(next) => {
            // Re-clicking a selected day would clear it; require Clear instead
            // so a time already set is not dropped by an accidental second tap.
            if (!next) return
            onChange(
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
          className="flex min-w-0 flex-col gap-2 border-t p-3"
        >
          <p className="text-xs font-semibold tracking-wide uppercase">Time</p>
          <div className="flex min-w-0 items-center gap-2">
            <Select
              modal={false}
              value={date ? padTimePart(date.getHours()) : undefined}
              onValueChange={(nextHour) => {
                if (!date) return
                onChange(
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
              modal={false}
              value={date ? padTimePart(date.getMinutes()) : undefined}
              onValueChange={(nextMinute) => {
                if (!date) return
                onChange(
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
        <div className="flex justify-end border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={empty}
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
