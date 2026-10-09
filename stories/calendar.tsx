import { useState } from "react"

import { Calendar } from "../src/calendar.js"

/** Single-day calendar with square cells. */
export function CalendarStory() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 9))

  return (
    <Calendar mode="single" selected={date} onSelect={setDate} month={date} />
  )
}
