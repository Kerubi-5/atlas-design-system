import { useState } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  DateTimePickerButton,
  resolveTimeStep,
} from "../src/date-time-picker.js"
import { FormDateTimePickerField } from "../src/form/date-time-picker-field.js"

import {
  createUser,
  expectFormControlTrigger,
  render,
  screen,
  waitFor,
} from "./helpers.js"

const october = new Date(2026, 9, 1)
const afternoon = new Date(2026, 9, 10, 14, 30)

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

function DateTimePickerHarness({
  initial = null,
  timeStep,
  placeholder = "Pick a date and time",
  onChange,
}: {
  initial?: Date | null
  timeStep?: number
  placeholder?: string
  onChange?: (date: Date | null) => void
}) {
  const [value, setValue] = useState<Date | null>(initial)
  return (
    <DateTimePickerButton
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
      timeStep={timeStep}
      defaultMonth={october}
      placeholder={placeholder}
    />
  )
}

describe("resolveTimeStep", () => {
  it("defaults to 15 and rejects values that do not divide 60", () => {
    expect(resolveTimeStep(undefined)).toBe(15)
    expect(resolveTimeStep(15)).toBe(15)
    expect(resolveTimeStep(1)).toBe(1)
    expect(resolveTimeStep(60)).toBe(60)
    expect(resolveTimeStep(7)).toBe(15)
    expect(resolveTimeStep(0)).toBe(15)
    expect(resolveTimeStep(-5)).toBe(15)
  })
})

describe("DateTimePickerButton", () => {
  it("opens, keeps the popover open after a day, then sets the time", async () => {
    const user = createUser()
    const onChange = vi.fn<(date: Date | null) => void>()
    render(<DateTimePickerHarness onChange={onChange} />)

    const trigger = screen.getByRole("button", { name: "Pick a date and time" })
    expectFormControlTrigger(trigger)
    expect(trigger).toHaveAttribute("data-empty", "true")

    await user.click(trigger)
    expect(await screen.findByRole("grid")).toBeVisible()
    expect(screen.getByRole("group", { name: "Time" })).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Hour" })).toBeDisabled()
    expect(screen.getByRole("combobox", { name: "Minute" })).toBeDisabled()

    await user.click(getDayButton(new Date(2026, 9, 15)))

    expect(screen.getByRole("grid")).toBeVisible()
    const afterDay = onChange.mock.calls.at(-1)?.[0]
    expect(afterDay).toBeInstanceOf(Date)
    expect(afterDay?.getFullYear()).toBe(2026)
    expect(afterDay?.getMonth()).toBe(9)
    expect(afterDay?.getDate()).toBe(15)
    expect(afterDay?.getHours()).toBe(0)
    expect(afterDay?.getMinutes()).toBe(0)
    expect(afterDay?.getSeconds()).toBe(0)

    const hour = screen.getByRole("combobox", { name: "Hour" })
    const minute = screen.getByRole("combobox", { name: "Minute" })
    expect(hour).toBeEnabled()
    expect(minute).toBeEnabled()

    await user.click(hour)
    await user.click(await screen.findByRole("option", { name: "14" }))
    const afterHour = onChange.mock.calls.at(-1)?.[0]
    expect(afterHour?.getHours()).toBe(14)
    expect(afterHour?.getMinutes()).toBe(0)
    expect(screen.getByRole("grid")).toBeVisible()

    await user.click(screen.getByRole("combobox", { name: "Minute" }))
    await user.click(await screen.findByRole("option", { name: "30" }))
    const afterMinute = onChange.mock.calls.at(-1)?.[0]
    expect(afterMinute?.getDate()).toBe(15)
    expect(afterMinute?.getHours()).toBe(14)
    expect(afterMinute?.getMinutes()).toBe(30)
    expect(afterMinute?.getSeconds()).toBe(0)
    expect(screen.getByRole("grid")).toBeVisible()
    expect(
      screen.getByRole("button", { name: /October 15.*2:30/ })
    ).toBeInTheDocument()
  })

  it("preserves the clock when the calendar day changes", async () => {
    const user = createUser()
    const onChange = vi.fn<(date: Date | null) => void>()
    render(<DateTimePickerHarness initial={afternoon} onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: /October 10.*2:30/ }))
    expect(await screen.findByRole("grid")).toBeVisible()

    await user.click(getDayButton(new Date(2026, 9, 20)))
    const next = onChange.mock.calls.at(-1)?.[0]
    expect(next?.getDate()).toBe(20)
    expect(next?.getHours()).toBe(14)
    expect(next?.getMinutes()).toBe(30)
    expect(screen.getByRole("grid")).toBeVisible()
  })

  it("clears the value and returns to the placeholder", async () => {
    const user = createUser()
    const onChange = vi.fn<(date: Date | null) => void>()
    render(<DateTimePickerHarness initial={afternoon} onChange={onChange} />)

    const trigger = screen.getByRole("button", { name: /October 10.*2:30/ })
    expect(trigger).toHaveAttribute("data-empty", "false")
    await user.click(trigger)
    expect(await screen.findByRole("grid")).toBeVisible()

    await user.click(screen.getByRole("button", { name: "Clear" }))
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(trigger).toHaveTextContent("Pick a date and time")
    expect(trigger).toHaveAttribute("data-empty", "true")
    expect(trigger).toHaveFocus()
  })

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = createUser()
    render(<DateTimePickerButton value={afternoon} onChange={() => {}} />)

    const trigger = screen.getByRole("button", { name: /October 10.*2:30/ })
    await user.click(trigger)
    expect(await screen.findByRole("grid")).toBeVisible()

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })

  it("limits minute options to the time step and still lists an off-step value", async () => {
    const user = createUser()
    render(
      <DateTimePickerButton
        value={new Date(2026, 9, 10, 14, 7)}
        onChange={() => {}}
        timeStep={15}
        defaultMonth={october}
      />
    )

    await user.click(screen.getByRole("button", { name: /October 10/ }))
    await user.click(screen.getByRole("combobox", { name: "Minute" }))

    const options = await screen.findAllByRole("option")
    const labels = options.map((option) => option.textContent)
    expect(labels).toEqual(["00", "07", "15", "30", "45"])
  })

  it("clamps the popover so a 390px viewport can keep it on-screen", async () => {
    const user = createUser()
    render(
      <DateTimePickerButton
        value={afternoon}
        onChange={() => {}}
        defaultMonth={october}
      />
    )

    await user.click(screen.getByRole("button", { name: /October 10.*2:30/ }))
    const popover = await waitFor(() => {
      const node = document.querySelector("[data-slot=popover-content]")
      expect(node).toBeTruthy()
      return node as HTMLElement
    })

    expect(screen.getAllByRole("grid")).toHaveLength(1)
    const classes = popover.className.split(/\s+/)
    expect(classes).toContain("w-auto")
    expect(classes).toContain("min-w-0")
    expect(classes).toContain("max-w-[min(100vw-2rem,24rem)]")
    expect(classes).toContain(
      "max-h-(--radix-popover-content-available-height)"
    )
    expect(classes).toContain("overflow-y-auto")
    expect(popover.className).not.toMatch(/\bw-72\b/)
    expect(screen.getByRole("group", { name: "Time" }).className).toMatch(
      /\bmin-w-0\b/
    )
  })

  it("forwards side to the popover", async () => {
    const user = createUser()
    render(
      <DateTimePickerButton
        value={afternoon}
        onChange={() => {}}
        side="top"
        defaultMonth={october}
      />
    )

    await user.click(screen.getByRole("button", { name: /October 10.*2:30/ }))
    const popover = await waitFor(() => {
      const node = document.querySelector("[data-slot=popover-content]")
      expect(node).toBeTruthy()
      return node as HTMLElement
    })
    expect(popover).toHaveAttribute("data-side", "top")
  })
})

describe("FormDateTimePickerField", () => {
  it("associates the label and opens from the labelled trigger", async () => {
    const user = createUser()
    render(
      <FormDateTimePickerField
        value={afternoon}
        onValueChange={() => {}}
        label="Starts"
      />
    )

    const trigger = screen.getByLabelText("Starts")
    expectFormControlTrigger(trigger)
    expect(trigger).toHaveTextContent(/October 10.*2:30/)
    expect(screen.getByText("Starts")).toHaveAttribute(
      "for",
      trigger.getAttribute("id")
    )

    await user.click(trigger)
    expect(await screen.findByRole("grid")).toBeVisible()
    expect(screen.getByRole("combobox", { name: "Hour" })).toHaveAccessibleName(
      "Hour"
    )
    expect(
      screen.getByRole("combobox", { name: "Minute" })
    ).toHaveAccessibleName("Minute")

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })

  it("renders a labelled trigger and field error", () => {
    const html = renderToStaticMarkup(
      <FormDateTimePickerField
        value={afternoon}
        onValueChange={() => {}}
        label="Starts"
        meta={{ errors: ["Required"] }}
      />
    )
    expect(html).toContain("Starts")
    expect(html).toContain("October 10")
    expect(html).toContain("2:30")
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('role="alert"')
    expect(html).toContain("rounded-none")
    expect(html).toContain("text-base")
    expect(html).toContain("px-3")
    expect(html).toContain("border-input")
  })

  it("forwards className onto the labelled trigger", () => {
    const html = renderToStaticMarkup(
      <FormDateTimePickerField
        value={afternoon}
        onValueChange={() => {}}
        label="Starts"
        className="w-40"
      />
    )
    expect(html).toContain("w-40")
  })
})
