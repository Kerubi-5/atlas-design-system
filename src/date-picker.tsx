"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "./button.js"
import { Calendar } from "./calendar.js"
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js"
import { cn } from "./utils.js"

export type DateLike = Date | string | number | null | undefined

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

type DatePickerButtonProps = {
  id?: string
  value?: DateLike
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean
}

/**
 * Calendar popover trigger. Accepts `Date` or `yyyy-MM-dd` strings; emits
 * `Date | undefined`. Square corners follow the shared shape rules.
 */
export function DatePickerButton({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: DatePickerButtonProps) {
  const [open, setOpen] = React.useState(false)
  const date = toDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          data-empty={!date}
          className={cn(
            "h-10 w-full justify-start font-normal tracking-normal normal-case data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-none p-0">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(next) => {
            onChange(next)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
