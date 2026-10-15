import { parseISO } from "date-fns"

/** A date the pickers accept: a `Date`, `yyyy-MM-dd`, ISO text, or a timestamp. */
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
