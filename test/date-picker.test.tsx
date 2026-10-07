import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../src/button.js"
import { Calendar } from "../src/calendar.js"
import { DatePickerButton } from "../src/date-picker.js"
import { FormDatePickerField } from "../src/form/date-picker-field.js"
import { Popover, PopoverContent, PopoverTrigger } from "../src/popover.js"

import { createUser, render, screen, waitFor, within } from "./helpers.js"

const october = new Date(2026, 9, 1)
const locale = { code: "en-US" }

/**
 * Day buttons expose `data-day` from `toLocaleDateString`. Pin en-US so the
 * query is stable in CI.
 */
function getDayButton(date: Date) {
  const stamp = date.toLocaleDateString("en-US")
  const button = document.querySelector(`[data-day="${stamp}"]`)
  if (!(button instanceof HTMLElement)) {
    throw new Error(`No calendar day button for ${stamp}`)
  }
  return button
}

function RangePopover() {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button">Export range</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-none p-0">
        <Calendar
          mode="range"
          locale={locale}
          numberOfMonths={2}
          selected={range}
          defaultMonth={october}
          onSelect={setRange}
        />
      </PopoverContent>
    </Popover>
  )
}

describe("Calendar", () => {
  it("selects a single day", async () => {
    const user = createUser()
    const onSelect = vi.fn()
    render(
      <Calendar
        mode="single"
        locale={locale}
        defaultMonth={october}
        onSelect={onSelect}
      />
    )

    expect(screen.getByRole("grid")).toBeInTheDocument()
    await user.click(getDayButton(new Date(2026, 9, 15)))
    expect(onSelect).toHaveBeenCalled()
    const selected = onSelect.mock.calls.at(-1)?.[0]
    expect(selected).toBeInstanceOf(Date)
    expect((selected as Date).getDate()).toBe(15)
  })

  it("selects a range across a two-month grid", async () => {
    const user = createUser()
    const onSelect = vi.fn<(range: DateRange | undefined) => void>()

    function RangeCalendar() {
      const [range, setRange] = useState<DateRange | undefined>()
      return (
        <Calendar
          mode="range"
          locale={locale}
          numberOfMonths={2}
          defaultMonth={october}
          selected={range}
          onSelect={(next) => {
            setRange(next)
            onSelect(next)
          }}
        />
      )
    }

    render(<RangeCalendar />)

    const captions = screen.getAllByText(/2026/)
    expect(
      captions.some((node) => /October/.test(node.textContent ?? ""))
    ).toBe(true)
    expect(
      captions.some((node) => /November/.test(node.textContent ?? ""))
    ).toBe(true)

    await user.click(getDayButton(new Date(2026, 9, 5)))
    await user.click(getDayButton(new Date(2026, 10, 10)))

    const last = onSelect.mock.calls.at(-1)?.[0]
    expect(last?.from?.getDate()).toBe(5)
    expect(last?.from?.getMonth()).toBe(9)
    expect(last?.to?.getDate()).toBe(10)
    expect(last?.to?.getMonth()).toBe(10)

    expect(getDayButton(new Date(2026, 9, 5))).toHaveAttribute(
      "data-range-start",
      "true"
    )
    expect(getDayButton(new Date(2026, 10, 10))).toHaveAttribute(
      "data-range-end",
      "true"
    )
    expect(getDayButton(new Date(2026, 9, 15))).toHaveAttribute(
      "data-range-middle",
      "true"
    )
  })
})

describe("DatePickerButton", () => {
  it("opens, selects a day, and closes", async () => {
    const user = createUser()
    const onChange = vi.fn<(date: Date | undefined) => void>()
    render(<DatePickerButton value="2026-10-05" onChange={onChange} />)

    const trigger = screen.getByRole("button", { name: /^October 5/ })
    await user.click(trigger)
    expect(await screen.findByRole("grid")).toBeVisible()

    await user.click(getDayButton(new Date(2026, 9, 15)))

    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    expect(onChange).toHaveBeenCalled()
    const next = onChange.mock.calls.at(-1)?.[0]
    expect(next?.getDate()).toBe(15)
  })

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = createUser()
    render(<DatePickerButton value="2026-10-05" onChange={() => {}} />)

    const trigger = screen.getByRole("button", { name: /^October 5/ })
    await user.click(trigger)
    expect(await screen.findByRole("grid")).toBeVisible()

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })
})

describe("FormDatePickerField", () => {
  it("associates the label and opens from the labelled trigger", async () => {
    const user = createUser()
    render(
      <FormDatePickerField
        value="2026-10-05"
        onValueChange={() => {}}
        label="Due"
      />
    )

    const trigger = screen.getByLabelText("Due")
    expect(trigger).toHaveTextContent("October 5th, 2026")
    expect(screen.getByText("Due")).toHaveAttribute(
      "for",
      trigger.getAttribute("id")
    )

    await user.click(trigger)
    expect(await screen.findByRole("grid")).toBeVisible()

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })
})

describe("nested range picker popover", () => {
  it("keeps a two-month, auto-sized popover after selecting a range", async () => {
    const user = createUser()
    render(<RangePopover />)

    await user.click(screen.getByRole("button", { name: "Export range" }))
    const popover = await waitFor(() => {
      const node = document.querySelector("[data-slot=popover-content]")
      expect(node).toBeTruthy()
      return node as HTMLElement
    })

    expect(popover).toHaveClass("w-auto")
    expect(popover.className).not.toMatch(/\bw-72\b/)

    await user.click(getDayButton(new Date(2026, 9, 5)))
    await user.click(getDayButton(new Date(2026, 10, 10)))

    const after = document.querySelector("[data-slot=popover-content]")
    expect(after).toHaveClass("w-auto")
    expect(after?.className ?? "").not.toMatch(/\bw-72\b/)
    expect(
      within(after as HTMLElement)
        .getAllByText(/2026/)
        .some((node) => /October/.test(node.textContent ?? ""))
    ).toBe(true)
    expect(
      within(after as HTMLElement)
        .getAllByText(/2026/)
        .some((node) => /November/.test(node.textContent ?? ""))
    ).toBe(true)
  })
})
