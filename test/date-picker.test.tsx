import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Calendar } from "../src/calendar.js"
import { DatePickerButton, type DateRange } from "../src/date-picker.js"
import { FormDatePickerField } from "../src/form/date-picker-field.js"

import {
  createUser,
  expectFormControlTrigger,
  render,
  screen,
  stubMatchMedia,
  waitFor,
  within,
} from "./helpers.js"

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

function RangePickerHarness({
  initial,
  placeholder = "Export range",
  onChange,
}: {
  initial?: DateRange
  placeholder?: string
  onChange?: (range: DateRange | undefined) => void
}) {
  const [range, setRange] = useState<DateRange | undefined>(initial)
  return (
    <DatePickerButton
      mode="range"
      value={range}
      onChange={(next) => {
        setRange(next)
        onChange?.(next)
      }}
      defaultMonth={october}
      numberOfMonths={2}
      placeholder={placeholder}
    />
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
    expectFormControlTrigger(trigger)
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
    expectFormControlTrigger(trigger)
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

describe("DatePickerButton range mode", () => {
  it("opens and closes from the trigger", async () => {
    const user = createUser()
    render(<RangePickerHarness />)

    const trigger = screen.getByRole("button", { name: "Export range" })
    expect(trigger).toHaveAttribute("data-empty", "true")

    await user.click(trigger)
    expect(await screen.findAllByRole("grid")).toHaveLength(2)

    await user.click(trigger)
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
  })

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = createUser()
    render(<RangePickerHarness />)

    const trigger = screen.getByRole("button", { name: "Export range" })
    await user.click(trigger)
    expect(await screen.findAllByRole("grid")).toHaveLength(2)

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveTextContent("Export range")
  })

  it("picks a range across two months and closes", async () => {
    const user = createUser()
    const onChange = vi.fn<(range: DateRange | undefined) => void>()
    render(<RangePickerHarness onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: "Export range" }))
    expect(await screen.findAllByRole("grid")).toHaveLength(2)

    await user.click(getDayButton(new Date(2026, 9, 5)))
    expect(onChange).toHaveBeenCalled()
    expect(screen.getAllByRole("grid")).toHaveLength(2)

    await user.click(getDayButton(new Date(2026, 10, 10)))
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    const last = onChange.mock.calls.at(-1)?.[0]
    expect(last?.from?.getDate()).toBe(5)
    expect(last?.from?.getMonth()).toBe(9)
    expect(last?.to?.getDate()).toBe(10)
    expect(last?.to?.getMonth()).toBe(10)
  })

  it("clears a selected range and returns to the placeholder", async () => {
    const user = createUser()
    render(
      <RangePickerHarness
        initial={{
          from: new Date(2026, 9, 5),
          to: new Date(2026, 10, 10),
        }}
      />
    )

    const trigger = screen.getByRole("button", { name: /October 5/ })
    expect(trigger).toHaveTextContent("November 10")
    expect(trigger).toHaveAttribute("data-empty", "false")

    await user.click(trigger)
    expect(await screen.findAllByRole("grid")).toHaveLength(2)

    await user.click(screen.getByRole("button", { name: "Clear" }))
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    expect(trigger).toHaveTextContent("Export range")
    expect(trigger).toHaveAttribute("data-empty", "true")
    expect(trigger).toHaveFocus()
  })

  it("starts a new range when opened on a complete range", async () => {
    const user = createUser()
    const onChange = vi.fn<(range: DateRange | undefined) => void>()
    render(
      <RangePickerHarness
        initial={{ from: new Date(2026, 9, 5), to: new Date(2026, 9, 10) }}
        onChange={onChange}
      />
    )

    await user.click(screen.getByRole("button", { name: /October 5/ }))
    expect(await screen.findAllByRole("grid")).toHaveLength(2)

    // The first click restarts the range instead of extending Oct 5 – 10.
    await user.click(getDayButton(new Date(2026, 9, 20)))
    expect(screen.getAllByRole("grid")).toHaveLength(2)
    const started = onChange.mock.calls.at(-1)?.[0]
    expect(started?.from?.getDate()).toBe(20)
    expect(started?.to?.getDate()).toBe(20)

    await user.click(getDayButton(new Date(2026, 9, 25)))
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    const last = onChange.mock.calls.at(-1)?.[0]
    expect(last?.from?.getDate()).toBe(20)
    expect(last?.to?.getDate()).toBe(25)
    expect(
      screen.getByRole("button", { name: /October 20.*October 25/ })
    ).toBeInTheDocument()
  })

  it("finishes an incomplete range on the next click", async () => {
    const user = createUser()
    const onChange = vi.fn<(range: DateRange | undefined) => void>()
    render(
      <RangePickerHarness
        initial={{ from: new Date(2026, 9, 5), to: undefined }}
        onChange={onChange}
      />
    )

    await user.click(screen.getByRole("button", { name: /October 5/ }))
    expect(await screen.findAllByRole("grid")).toHaveLength(2)

    await user.click(getDayButton(new Date(2026, 9, 9)))
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    const last = onChange.mock.calls.at(-1)?.[0]
    expect(last?.from?.getDate()).toBe(5)
    expect(last?.to?.getDate()).toBe(9)
  })

  it("keeps a two-month, auto-sized popover while the calendar is open", async () => {
    const user = createUser()
    render(<RangePickerHarness />)

    await user.click(screen.getByRole("button", { name: "Export range" }))
    const popover = await waitFor(() => {
      const node = document.querySelector("[data-slot=popover-content]")
      expect(node).toBeTruthy()
      return node as HTMLElement
    })

    expect(popover).toHaveClass("w-auto")
    expect(popover.className).not.toMatch(/\bw-72\b/)
    expect(screen.getAllByRole("grid")).toHaveLength(2)
    expect(
      within(popover)
        .getAllByText(/2026/)
        .some((node) => /October/.test(node.textContent ?? ""))
    ).toBe(true)
    expect(
      within(popover)
        .getAllByText(/2026/)
        .some((node) => /November/.test(node.textContent ?? ""))
    ).toBe(true)

    await user.click(getDayButton(new Date(2026, 9, 5)))
    const afterStart = document.querySelector("[data-slot=popover-content]")
    expect(afterStart).toHaveClass("w-auto")
    expect(afterStart?.className ?? "").not.toMatch(/\bw-72\b/)
    expect(screen.getAllByRole("grid")).toHaveLength(2)
  })

  it("clamps the popover to the viewport and defaults to one month below md", async () => {
    const user = createUser()
    render(
      <DatePickerButton
        mode="range"
        onChange={() => {}}
        defaultMonth={october}
        placeholder="Export range"
      />
    )

    await user.click(screen.getByRole("button", { name: "Export range" }))
    const popover = await waitFor(() => {
      const node = document.querySelector("[data-slot=popover-content]")
      expect(node).toBeTruthy()
      return node as HTMLElement
    })

    expect(screen.getAllByRole("grid")).toHaveLength(1)
    expect(popover.className.split(/\s+/)).toContain("w-auto")
    expect(popover.className.split(/\s+/)).toContain(
      "max-h-(--radix-popover-content-available-height)"
    )
    expect(popover.className.split(/\s+/)).toContain("overflow-y-auto")
  })

  it("defaults to two months at md and above when numberOfMonths is omitted", async () => {
    stubMatchMedia((query) => query.includes("768"))
    const user = createUser()
    render(
      <DatePickerButton
        mode="range"
        onChange={() => {}}
        defaultMonth={october}
        placeholder="Export range"
      />
    )

    await user.click(screen.getByRole("button", { name: "Export range" }))
    expect(await screen.findAllByRole("grid")).toHaveLength(2)
  })

  it("honors an explicit numberOfMonths below md", async () => {
    const user = createUser()
    render(
      <DatePickerButton
        mode="range"
        onChange={() => {}}
        defaultMonth={october}
        numberOfMonths={2}
        placeholder="Export range"
      />
    )

    await user.click(screen.getByRole("button", { name: "Export range" }))
    expect(await screen.findAllByRole("grid")).toHaveLength(2)
  })

  it("forwards side to the range popover", async () => {
    const user = createUser()
    render(
      <DatePickerButton
        mode="range"
        onChange={() => {}}
        defaultMonth={october}
        side="top"
        placeholder="Export range"
      />
    )

    await user.click(screen.getByRole("button", { name: "Export range" }))
    const popover = await waitFor(() => {
      const node = document.querySelector("[data-slot=popover-content]")
      expect(node).toBeTruthy()
      return node as HTMLElement
    })
    expect(popover).toHaveAttribute("data-side", "top")
  })
})
