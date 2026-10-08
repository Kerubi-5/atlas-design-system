"use client"

import * as React from "react"
import { format, isSameDay, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "./button.js"
import { Calendar } from "./calendar.js"
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js"
import { cn } from "./utils.js"

export type { DateRange }

export type DateLike = Date | string | number | null | undefined

/** From/to value for `DatePickerButton` in range mode; each side is `DateLike`. */
export type DatePickerRangeValue = {
  from?: DateLike
  to?: DateLike
}

/**
 * Coerce a date-like value to a local `Date`.
 * Plain calendar dates (`yyyy-MM-dd`) parse as local midnight so they do not
 * shift when the runtime timezone is behind UTC.
 */
export function toDate(value: DateLike): Date | undefined {
  if (value == null || value === "") return undefined
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value
  }
  if (typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
  }

  const trimmed = value.trim()
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (ymd) {
    const year = Number(ymd[1])
    const month = Number(ymd[2])
    const day = Number(ymd[3])
    const date = new Date(year, month - 1, day)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return undefined
    }
    return date
  }

  const parsed = parseISO(trimmed)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/** Format a Date as a timezone-safe calendar date (`yyyy-MM-dd`). */
export function formatLocalDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

type DatePickerSharedProps = {
  id?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean
  /**
   * Visible months in the popover calendar. Defaults to 1 in single mode
   * and 2 in range mode.
   */
  numberOfMonths?: number
  /** Month shown when the popover opens; falls back to the selected date. */
  defaultMonth?: Date
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

/** Shared trigger + auto-sized popover chrome for single and range modes. */
function DatePickerShell({
  id,
  disabled,
  ariaInvalid,
  className,
  empty,
  label,
  open,
  onOpenChange,
  children,
}: {
  id?: string
  disabled?: boolean
  ariaInvalid?: boolean
  className?: string
  empty: boolean
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          data-empty={empty}
          className={cn(
            "h-10 w-full justify-start font-normal tracking-normal normal-case data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-none p-0">
        {children}
      </PopoverContent>
    </Popover>
  )
}

function DatePickerSingleButton({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  numberOfMonths,
  defaultMonth,
}: DatePickerSingleProps) {
  const [open, setOpen] = React.useState(false)
  const date = toDate(value)

  return (
    <DatePickerShell
      id={id}
      disabled={disabled}
      ariaInvalid={ariaInvalid}
      className={className}
      empty={!date}
      label={date ? format(date, "PPP") : placeholder}
      open={open}
      onOpenChange={setOpen}
    >
      <Calendar
        mode="single"
        selected={date}
        defaultMonth={defaultMonth ?? date}
        numberOfMonths={numberOfMonths}
        onSelect={(next) => {
          onChange(next)
          setOpen(false)
        }}
      />
    </DatePickerShell>
  )
}

function DatePickerRangeButton({
  id,
  value,
  onChange,
  placeholder = "Pick a date range",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  numberOfMonths = 2,
  defaultMonth,
}: DatePickerRangeProps) {
  const [open, setOpen] = React.useState(false)
  const from = toDate(value?.from)
  const to = toDate(value?.to)
  const selected: DateRange | undefined = from || to ? { from, to } : undefined

  return (
    <DatePickerShell
      id={id}
      disabled={disabled}
      ariaInvalid={ariaInvalid}
      className={className}
      empty={!from}
      label={formatRangeTriggerLabel(from, to, placeholder)}
      open={open}
      onOpenChange={setOpen}
    >
      <Calendar
        mode="range"
        selected={selected}
        defaultMonth={defaultMonth ?? from ?? to}
        numberOfMonths={numberOfMonths}
        onSelect={(next) => {
          onChange(next)
          // First click is a same-day range; keep the popover open so the
          // user can set `to`. Close once the ends differ.
          if (next?.from && next.to && !isSameDay(next.from, next.to)) {
            setOpen(false)
          }
        }}
      />
      <div className="flex justify-end border-t p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!from && !to}
          onClick={() => {
            onChange(undefined)
            setOpen(false)
          }}
        >
          Clear
        </Button>
      </div>
    </DatePickerShell>
  )
}

/**
 * Calendar popover trigger. `mode="single"` (default) accepts `Date` or
 * `yyyy-MM-dd` and emits `Date | undefined`. `mode="range"` accepts
 * `{ from, to }` and emits `DateRange | undefined`. Square corners follow
 * the shared shape rules.
 */
export function DatePickerButton(props: DatePickerButtonProps) {
  if (props.mode === "range") {
    return <DatePickerRangeButton {...props} />
  }
  return <DatePickerSingleButton {...props} />
}
