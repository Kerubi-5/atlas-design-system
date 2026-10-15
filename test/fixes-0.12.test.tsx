import { act } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DatePickerButton } from "../src/date-picker.js"
import { DateTimePickerButton } from "../src/date-time-picker.js"
import { FieldLabel } from "../src/field.js"
import { FormDatePickerField } from "../src/form/date-picker-field.js"
import { FormDateTimePickerField } from "../src/form/date-time-picker-field.js"
import { FormMarkdownField } from "../src/form/markdown-field.js"
import { FormSelectField } from "../src/form/select-field.js"
import { FormTextField } from "../src/form/text-field.js"
import { Label } from "../src/label.js"
import { SelectItem } from "../src/select.js"
import { Toaster, toast } from "../src/toast.js"

import {
  createUser,
  fakeTextField,
  render,
  screen,
  stubMatchMedia,
  waitFor,
} from "./helpers.js"

function getDayButton(date: Date) {
  const stamp = date.toLocaleDateString("en-US")
  const button = document.querySelector(`[data-day="${stamp}"]`)
  if (!(button instanceof HTMLElement)) {
    throw new Error(`No calendar day button for ${stamp}`)
  }
  return button
}

const day = (date: number, month = 9, year = 2026) =>
  new Date(year, month, date)

describe("date picker minDate and maxDate", () => {
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
    await user.click(screen.getByRole("button", { name: /^October 15/ }))
    await screen.findByRole("grid")

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
    await user.click(screen.getByRole("button", { name: /^October 15/ }))
    await screen.findByRole("grid")

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
    await user.click(screen.getByRole("button", { name: "Pick a date" }))
    await screen.findByRole("grid")
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
    await user.click(screen.getByRole("button", { name: /^October 12/ }))
    await screen.findByRole("grid")
    expect(getDayButton(day(9))).toBeDisabled()
    expect(getDayButton(day(21))).toBeDisabled()
  })

  it("limits the date-time picker", async () => {
    const user = createUser()
    render(
      <DateTimePickerButton
        value={new Date(2026, 9, 15, 9, 30)}
        minDate={day(10)}
        maxDate={day(20)}
        onChange={() => {}}
      />
    )
    await user.click(screen.getByRole("button", { name: /^October 15/ }))
    await screen.findByRole("grid")
    expect(getDayButton(day(9))).toBeDisabled()
    expect(getDayButton(day(21))).toBeDisabled()
  })

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
    await user.click(screen.getByRole("button", { name: /^Due/ }))
    await screen.findByRole("grid")
    expect(getDayButton(day(9))).toBeDisabled()
  })
})

describe("visible required marker", () => {
  it("marks a required Label without changing its name", () => {
    render(
      <>
        <Label htmlFor="email" required>
          Email
        </Label>
        <input id="email" required />
      </>
    )
    const marker = document.querySelector('[data-slot="label-required"]')
    expect(marker).toHaveTextContent("*")
    expect(marker).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByRole("textbox")).toHaveAccessibleName("Email")
  })

  it("leaves optional labels unmarked and styles the marker by className", () => {
    render(
      <>
        <Label>Optional</Label>
        <FieldLabel required requiredClassName="text-primary">
          Name
        </FieldLabel>
      </>
    )
    const markers = document.querySelectorAll('[data-slot="label-required"]')
    expect(markers).toHaveLength(1)
    expect(markers[0]).toHaveClass("text-primary")
  })

  it("marks required text and markdown fields and keeps native required", () => {
    render(
      <>
        <FormTextField
          field={fakeTextField("email", "")}
          label="Email"
          required
        />
        <FormMarkdownField
          field={fakeTextField("body", "")}
          label="Body"
          required
        />
        <FormTextField field={fakeTextField("nick", "")} label="Nickname" />
      </>
    )
    expect(
      document.querySelectorAll('[data-slot="label-required"]')
    ).toHaveLength(2)
    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired()
    expect(screen.getByRole("textbox", { name: "Body" })).toBeRequired()
    expect(screen.getByRole("textbox", { name: "Nickname" })).not.toBeRequired()
  })

  it("marks a required select and sets aria-required on its trigger", () => {
    render(
      <FormSelectField
        label="Status"
        value={undefined}
        onValueChange={() => {}}
        required
      >
        <SelectItem value="open">Open</SelectItem>
      </FormSelectField>
    )
    expect(
      document.querySelector('[data-slot="label-required"]')
    ).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Status" })).toBeRequired()
  })

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

describe("stacked toasts", () => {
  // Wait for Sonner's unmount timers, so none fires after jsdom is torn down.
  afterEach(async () => {
    act(() => {
      toast.dismiss()
    })
    await waitFor(() =>
      expect(document.querySelector("[data-sonner-toast]")).toBeNull()
    )
  })

  it("expands the stack while keyboard focus is inside it", async () => {
    const user = createUser()
    render(
      <>
        <button type="button">Before</button>
        <Toaster />
      </>
    )
    act(() => {
      toast("First")
      toast("Second")
    })
    await screen.findByText("Second")
    const toasts = () =>
      Array.from(document.querySelectorAll("[data-sonner-toast]"))
    await waitFor(() => expect(toasts()).toHaveLength(2))
    for (const item of toasts()) {
      expect(item).toHaveAttribute("data-expanded", "false")
    }

    screen.getByRole("button", { name: "Before" }).focus()
    await user.tab()
    for (const item of toasts()) {
      expect(item).toHaveAttribute("data-expanded", "true")
    }

    act(() => {
      screen.getByRole("button", { name: "Before" }).focus()
    })
    await waitFor(() => {
      for (const item of toasts()) {
        expect(item).toHaveAttribute("data-expanded", "false")
      }
    })
  })
})
