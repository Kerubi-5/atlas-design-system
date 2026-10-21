import { fr } from "date-fns/locale"
import { useState } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Calendar } from "../src/calendar.js"
import {
  DatePickerButton,
  type DateRange,
  formatLocalDate,
  toDate,
} from "../src/date-picker.js"
import { FormDatePickerField } from "../src/form/date-picker-field.js"
import { FormDateTimePickerField } from "../src/form/date-time-picker-field.js"

import {
  createUser,
  day,
  expectFormControlTrigger,
  findPopoverContent,
  getDayButton,
  october,
  openPicker,
  render,
  screen,
  stubMatchMedia,
  waitFor,
  waitForNoRole,
  within,
} from "./helpers.js"

const locale = { code: "en-US" }

/** The range `spy` was last called with, as local `yyyy-MM-dd` days. */
function lastRange(spy: {
  mock: { calls: [DateRange | undefined, ...unknown[]][] }
}) {
  const range = spy.mock.calls.at(-1)?.[0]
  return [
    range?.from && formatLocalDate(range.from),
    range?.to && formatLocalDate(range.to),
  ]
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

describe("date helpers", () => {
  it("parses local calendar dates without UTC shifting", () => {
    const date = toDate("2026-10-05")
    expect(date?.getFullYear()).toBe(2026)
    expect(date?.getMonth()).toBe(9)
    expect(date?.getDate()).toBe(5)
    expect(toDate("")).toBeUndefined()
    expect(toDate(undefined)).toBeUndefined()
    expect(toDate("2026-13-40")).toBeUndefined()
  })

  it("round-trips a Date through formatLocalDate", () => {
    const date = day(5)
    expect(formatLocalDate(date)).toBe("2026-10-05")
    expect(toDate(date)).toBe(date)
  })
})

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
    await user.click(getDayButton(day(15)))
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

    await user.click(getDayButton(day(5)))
    await user.click(getDayButton(new Date(2026, 10, 10)))

    expect(lastRange(onSelect)).toEqual(["2026-10-05", "2026-11-10"])

    expect(getDayButton(day(5))).toHaveAttribute("data-range-start", "true")
    expect(getDayButton(new Date(2026, 10, 10))).toHaveAttribute(
      "data-range-end",
      "true"
    )
    expect(getDayButton(day(15))).toHaveAttribute("data-range-middle", "true")
  })

  it("preserves calendar nodes on parent updates and refreshes locale without losing navigation focus", () => {
    const month = day(1)
    const { container, rerender } = render(
      <Calendar mode="single" defaultMonth={month} />
    )
    const root = container.querySelector('[data-slot="calendar"]')
    const dayButton =
      container.querySelector<HTMLButtonElement>("button[data-day]")!
    const nextMonth = screen.getByRole("button", {
      name: "Go to the Next Month",
    })
    nextMonth.focus()

    rerender(
      <Calendar mode="single" defaultMonth={month} className="updated" />
    )
    expect(container.querySelector('[data-slot="calendar"]')).toBe(root)
    expect(container.querySelector("button[data-day]")).toBe(dayButton)
    expect(nextMonth).toHaveFocus()

    rerender(
      <Calendar
        mode="single"
        defaultMonth={month}
        locale={fr}
        weekStartsOn={0}
      />
    )
    expect(container.querySelector('[data-slot="calendar"]')).toBe(root)
    const localizedDay =
      container.querySelector<HTMLButtonElement>("button[data-day]")!
    expect(localizedDay.dataset.day).toBe(
      new Date(2026, 8, 27).toLocaleDateString("fr")
    )
    expect(localizedDay).toHaveAccessibleName(/septembre/)
    expect(nextMonth).toHaveFocus()
  })
})

describe("Calendar dropdown caption", () => {
  // The native month/year select is invisible over the caption label, so its
  // wrapper carries the focus ring (WCAG 2.4.7).
  it("shows a solid focus ring around the focused month and year", () => {
    render(
      <Calendar mode="single" captionLayout="dropdown" defaultMonth={october} />
    )
    for (const name of [/month/i, /year/i]) {
      const root = screen
        .getByRole("combobox", { name })
        .closest(".rdp-dropdown_root")
      expect(root?.className).toContain("has-focus-visible:ring-2")
      expect(root?.className).toContain("has-focus-visible:ring-ring")
    }
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

    await user.click(getDayButton(day(15)))

    await waitForNoRole("grid")
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
    await waitForNoRole("grid")
    expect(trigger).toHaveFocus()
  })

  // WAI-ARIA APG date picker dialog: a named dialog, focus on the date.
  it("opens a named dialog with focus on the selected day", async () => {
    const user = createUser()
    render(<DatePickerButton value="2026-10-05" onChange={() => {}} />)

    await openPicker(user, /^October 5/)
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Choose date")
    await waitFor(() => expect(getDayButton(day(5))).toHaveFocus())
  })

  it("focuses today when nothing is selected", async () => {
    const user = createUser()
    render(<DatePickerButton value={undefined} onChange={() => {}} />)

    await openPicker(user, "Pick a date")
    await waitFor(() => expect(getDayButton(new Date())).toHaveFocus())
  })

  it("forwards aria-labelledby and aria-describedby to the trigger", () => {
    render(
      <>
        <span id="due-label">Due</span>
        <span id="due-hint">Business days only</span>
        <DatePickerButton
          id="due"
          value="2026-10-05"
          onChange={() => {}}
          aria-labelledby="due-label due"
          aria-describedby="due-hint"
        />
      </>
    )
    const trigger = screen.getByRole("button", { name: /^Due.*October 5/ })
    expect(trigger).toHaveAccessibleDescription("Business days only")
  })

  it("shows the placeholder when empty", () => {
    const html = renderToStaticMarkup(
      <DatePickerButton value={undefined} onChange={() => {}} />
    )
    expect(html).toContain("Pick a date")
    expect(html).toContain('data-empty="true"')
  })
})

describe("DatePickerButton minDate and maxDate", () => {
  it("disables days outside the range and keeps navigation inside it", async () => {
    const user = createUser()
    const onChange = vi.fn()
    render(
      <DatePickerButton
        value="2026-10-15"
        minDate="2026-10-10"
        maxDate={day(20)}
        onChange={onChange}
      />
    )
    await openPicker(user, /^October 15/)

    expect(getDayButton(day(9))).toBeDisabled()
    expect(getDayButton(day(21))).toBeDisabled()
    expect(getDayButton(day(10))).toBeEnabled()
    expect(getDayButton(day(20))).toBeEnabled()
    expect(
      screen.getByRole("button", { name: /previous month/i })
    ).toHaveAttribute("aria-disabled", "true")
    expect(screen.getByRole("button", { name: /next month/i })).toHaveAttribute(
      "aria-disabled",
      "true"
    )

    await user.click(getDayButton(day(9)))
    expect(onChange).not.toHaveBeenCalled()
  })

  it("keeps calendarProps.disabled alongside the limits", async () => {
    const user = createUser()
    render(
      <DatePickerButton
        value="2026-10-15"
        minDate="2026-10-06"
        calendarProps={{ disabled: { dayOfWeek: [0] } }}
        onChange={() => {}}
      />
    )
    await openPicker(user, /^October 15/)

    // October 11, 2026 is a Sunday; Monday October 5 is before minDate.
    expect(getDayButton(day(11))).toBeDisabled()
    expect(getDayButton(day(5))).toBeDisabled()
    expect(getDayButton(day(12))).toBeEnabled()
  })

  it("opens on the first allowed month when nothing is picked", async () => {
    const user = createUser()
    render(
      <DatePickerButton
        value={undefined}
        minDate="2099-03-10"
        onChange={() => {}}
      />
    )
    await openPicker(user, "Pick a date")
    expect(getDayButton(day(10, 2, 2099))).toBeEnabled()
    expect(getDayButton(day(9, 2, 2099))).toBeDisabled()
  })

  it("limits range mode", async () => {
    stubMatchMedia(false)
    const user = createUser()
    render(
      <DatePickerButton
        mode="range"
        value={{ from: "2026-10-12", to: "2026-10-14" }}
        minDate="2026-10-10"
        maxDate="2026-10-20"
        onChange={() => {}}
      />
    )
    await openPicker(user, /^October 12/)
    expect(getDayButton(day(9))).toBeDisabled()
    expect(getDayButton(day(21))).toBeDisabled()
  })

  // The date-time field is rendered too so both adapters forward the limits.
  it("forwards the limits from the form fields", async () => {
    const user = createUser()
    render(
      <>
        <FormDatePickerField
          label="Due"
          value="2026-10-15"
          minDate="2026-10-10"
          onValueChange={() => {}}
        />
        <FormDateTimePickerField
          label="Starts"
          value={null}
          maxDate={day(20)}
          onValueChange={() => {}}
        />
      </>
    )
    await openPicker(user, /^Due/)
    expect(getDayButton(day(9))).toBeDisabled()
  })
})

describe("DatePickerButton clearable", () => {
  it("shows a Clear row only when clearable", async () => {
    const user = createUser()
    const { unmount } = render(
      <DatePickerButton value="2026-10-05" onValueChange={() => {}} />
    )
    await openPicker(user, /^October 5/)
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull()
    unmount()

    render(
      <DatePickerButton value="2026-10-05" onValueChange={() => {}} clearable />
    )
    await openPicker(user, /^October 5/)
    expect(screen.getByRole("button", { name: "Clear" })).toBeEnabled()
  })

  it("disables Clear while nothing is picked", async () => {
    const user = createUser()
    render(<DatePickerButton onValueChange={() => {}} clearable />)
    await openPicker(user, "Pick a date")
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled()
  })

  it("emits undefined and closes on Clear", async () => {
    const user = createUser()
    const onValueChange = vi.fn<(date: Date | undefined) => void>()
    render(
      <DatePickerButton
        value="2026-10-05"
        onValueChange={onValueChange}
        clearable
      />
    )
    const trigger = screen.getByRole("button", { name: /^October 5/ })
    await user.click(trigger)
    await screen.findByRole("grid")

    await user.click(screen.getByRole("button", { name: "Clear" }))
    await waitForNoRole("grid")
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
    expect(trigger).toHaveFocus()
  })

  it("keeps the day when the selected day is clicked again", async () => {
    const user = createUser()
    const onValueChange = vi.fn<(date: Date | undefined) => void>()
    render(
      <DatePickerButton
        value="2026-10-05"
        onValueChange={onValueChange}
        clearable
      />
    )
    await openPicker(user, /^October 5/)

    await user.click(getDayButton(day(5)))
    await waitForNoRole("grid")
    expect(onValueChange.mock.calls.at(-1)?.[0]?.getDate()).toBe(5)
  })

  it("still clears on a second click without clearable, as before", async () => {
    const user = createUser()
    const onValueChange = vi.fn<(date: Date | undefined) => void>()
    render(
      <DatePickerButton value="2026-10-05" onValueChange={onValueChange} />
    )
    await openPicker(user, /^October 5/)

    await user.click(getDayButton(day(5)))
    await waitForNoRole("grid")
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
  })
})

describe("FormDatePickerField", () => {
  it("forwards clearable to the picker", async () => {
    const user = createUser()
    const onValueChange = vi.fn<(date: Date | undefined) => void>()
    render(
      <FormDatePickerField
        value="2026-10-05"
        onValueChange={onValueChange}
        label="Due"
        clearable
      />
    )
    await user.click(screen.getByLabelText("Due"))
    await screen.findByRole("grid")
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
  })

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
    // aria-labelledby lists the label and the trigger text, so the picked
    // date is read too (a <label for> alone would name it "Due" only).
    // The <label for> stays, so clicking the label still reaches the trigger.
    expect(screen.getByText("Due")).toHaveAttribute("for", trigger.id)
    expect(trigger).toHaveAccessibleName(/^Due.*October 5th, 2026$/)
    expect(trigger).not.toHaveAttribute("aria-describedby")

    await user.click(trigger)
    expect(await screen.findByRole("grid")).toBeVisible()

    await user.keyboard("{Escape}")
    await waitForNoRole("grid")
    expect(trigger).toHaveFocus()
  })

  // Covers the date-time field too: both pickers share the required marker.
  it("marks required pickers and announces it in the trigger description", () => {
    render(
      <>
        <FormDatePickerField
          label="Due"
          value={undefined}
          required
          onValueChange={() => {}}
        />
        <FormDateTimePickerField
          label="Starts"
          value={null}
          required
          meta={{ errors: ["Pick a time"] }}
          onValueChange={() => {}}
        />
      </>
    )
    expect(
      document.querySelectorAll('[data-slot="label-required"]')
    ).toHaveLength(2)
    expect(
      screen.getByRole("button", { name: /^Due/ })
    ).toHaveAccessibleDescription("Required")
    expect(
      screen.getByRole("button", { name: /^Starts/ })
    ).toHaveAccessibleDescription("Required Pick a time")
  })
})

describe("FormDatePickerField errors", () => {
  it("describes the trigger with its error", () => {
    render(
      <FormDatePickerField
        value={undefined}
        onValueChange={() => {}}
        label="Due"
        meta={{ errors: ["Pick a due date"] }}
      />
    )
    const trigger = screen.getByLabelText("Due")
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    expect(trigger).toHaveAccessibleDescription("Pick a due date")
  })
})

describe("DatePickerButton range mode", () => {
  it("names the dialog for a range", async () => {
    const user = createUser()
    render(<RangePickerHarness />)

    await openPicker(user, "Export range")
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Choose dates")
  })

  it("opens and closes from the trigger", async () => {
    const user = createUser()
    render(<RangePickerHarness />)

    const trigger = screen.getByRole("button", { name: "Export range" })
    expect(trigger).toHaveAttribute("data-empty", "true")

    await user.click(trigger)
    expect(await screen.findAllByRole("grid")).toHaveLength(2)

    await user.click(trigger)
    await waitForNoRole("grid")
  })

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = createUser()
    render(<RangePickerHarness />)

    const trigger = screen.getByRole("button", { name: "Export range" })
    await user.click(trigger)
    expect(await screen.findAllByRole("grid")).toHaveLength(2)

    await user.keyboard("{Escape}")
    await waitForNoRole("grid")
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveTextContent("Export range")
  })

  it("picks a range across two months and closes", async () => {
    const user = createUser()
    const onChange = vi.fn<(range: DateRange | undefined) => void>()
    render(<RangePickerHarness onChange={onChange} />)

    expect(await openPicker(user, "Export range")).toHaveLength(2)

    await user.click(getDayButton(day(5)))
    expect(onChange).toHaveBeenCalled()
    expect(screen.getAllByRole("grid")).toHaveLength(2)

    await user.click(getDayButton(new Date(2026, 10, 10)))
    await waitForNoRole("grid")
    expect(lastRange(onChange)).toEqual(["2026-10-05", "2026-11-10"])
  })

  it("clears a selected range and returns to the placeholder", async () => {
    const user = createUser()
    render(
      <RangePickerHarness
        initial={{
          from: day(5),
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
    await waitForNoRole("grid")
    expect(trigger).toHaveTextContent("Export range")
    expect(trigger).toHaveAttribute("data-empty", "true")
    expect(trigger).toHaveFocus()
  })

  it("starts a new range when opened on a complete range", async () => {
    const user = createUser()
    const onChange = vi.fn<(range: DateRange | undefined) => void>()
    render(
      <RangePickerHarness
        initial={{ from: day(5), to: day(10) }}
        onChange={onChange}
      />
    )

    expect(await openPicker(user, /October 5/)).toHaveLength(2)

    // The first click restarts the range instead of extending Oct 5 – 10
    // (Day Picker's resetOnSelect): the clicked day is the new start.
    await user.click(getDayButton(day(20)))
    expect(screen.getAllByRole("grid")).toHaveLength(2)
    expect(lastRange(onChange)).toEqual(["2026-10-20", undefined])

    await user.click(getDayButton(day(25)))
    await waitForNoRole("grid")
    expect(lastRange(onChange)).toEqual(["2026-10-20", "2026-10-25"])
    expect(
      screen.getByRole("button", { name: /October 20.*October 25/ })
    ).toBeInTheDocument()
  })

  it("makes a one-day range from two clicks on the same day", async () => {
    const user = createUser()
    const onChange = vi.fn<(range: DateRange | undefined) => void>()
    render(<RangePickerHarness onChange={onChange} />)

    expect(await openPicker(user, "Export range")).toHaveLength(2)
    await user.click(getDayButton(day(5)))
    expect(lastRange(onChange)).toEqual(["2026-10-05", undefined])

    await user.click(getDayButton(day(5)))
    expect(lastRange(onChange)).toEqual(["2026-10-05", "2026-10-05"])
    // A same-day range keeps the popover open, as before.
    expect(screen.getAllByRole("grid")).toHaveLength(2)
  })

  it("finishes an incomplete range on the next click", async () => {
    const user = createUser()
    const onChange = vi.fn<(range: DateRange | undefined) => void>()
    render(
      <RangePickerHarness
        initial={{ from: day(5), to: undefined }}
        onChange={onChange}
      />
    )

    expect(await openPicker(user, /October 5/)).toHaveLength(2)

    await user.click(getDayButton(day(9)))
    await waitForNoRole("grid")
    expect(lastRange(onChange)).toEqual(["2026-10-05", "2026-10-09"])
  })

  it("keeps a two-month, auto-sized popover while the calendar is open", async () => {
    const user = createUser()
    render(<RangePickerHarness />)

    await user.click(screen.getByRole("button", { name: "Export range" }))
    const popover = await findPopoverContent()

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

    await user.click(getDayButton(day(5)))
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
    const popover = await findPopoverContent()

    expect(screen.getAllByRole("grid")).toHaveLength(1)
    expect(popover).toHaveClass("w-auto")
    expect(popover.className.split(/\s+/)).toContain(
      "max-h-(--radix-popover-content-available-height)"
    )
    expect(popover).toHaveClass("overflow-y-auto")
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

    expect(await openPicker(user, "Export range")).toHaveLength(2)
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

    expect(await openPicker(user, "Export range")).toHaveLength(2)
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
    const popover = await findPopoverContent()
    expect(popover).toHaveAttribute("data-side", "top")
  })

  it("renders a range trigger with from and to labels", () => {
    const html = renderToStaticMarkup(
      <DatePickerButton
        mode="range"
        value={{ from: "2026-10-05", to: "2026-11-10" }}
        onChange={() => {}}
      />
    )
    expect(html).toContain("October 5")
    expect(html).toContain("November 10")
    expect(html).toContain("rounded-none")
    expect(html).toContain('data-empty="false"')
  })

  it("shows the range placeholder when empty", () => {
    const html = renderToStaticMarkup(
      <DatePickerButton mode="range" value={undefined} onChange={() => {}} />
    )
    expect(html).toContain("Pick a date range")
    expect(html).toContain('data-empty="true"')
  })
})
