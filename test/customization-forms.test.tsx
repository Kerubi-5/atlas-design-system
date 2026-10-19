import { describe, expect, it, vi } from "vitest"

import { DatePickerButton } from "../src/date-picker.js"
import { DateTimePickerButton } from "../src/date-time-picker.js"
import { FormDatePickerField } from "../src/form/date-picker-field.js"
import { FormDateTimePickerField } from "../src/form/date-time-picker-field.js"
import { FieldError } from "../src/form/field-error.js"
import { FormFeedbackField } from "../src/form/feedback-field.js"
import { FormMarkdownField } from "../src/form/markdown-field.js"
import { FormSelectField } from "../src/form/select-field.js"
import { FormTextField } from "../src/form/text-field.js"
import { pickerValueId } from "../src/internal/form-control.js"
import { LazyCalendar } from "../src/lazy-calendar.js"
import { SelectItem } from "../src/select.js"

import {
  createUser,
  fakeTextField,
  getDayButton,
  render,
  screen,
  slot,
} from "./helpers.js"

const october = new Date(2026, 9, 1)

/** Day Picker's first weekday header (the row is hidden from the a11y tree). */
function firstWeekday() {
  return document.querySelector(".rdp-weekday")?.getAttribute("aria-label")
}

// Runs first: once the calendar chunk resolves, Suspense stops showing it.
describe("LazyCalendar fallback", () => {
  it("sizes the placeholder from the calendar's cell size and takes its className", () => {
    render(
      <LazyCalendar mode="single" className="[--cell-size:--spacing(10)]" />
    )
    const fallback = screen.getByLabelText("Loading calendar").parentElement
    expect(fallback?.className).toContain("[--cell-size:--spacing(10)]")
    expect(fallback?.className).toContain("var(--cell-size)")
    expect(fallback?.className).not.toMatch(/\bh-72\b|\bw-64\b/)
  })
})

describe("pickerValueId", () => {
  it("names the trigger text span", () => {
    expect(pickerValueId("due")).toBe("due-value")
  })
})

describe("DatePickerButton customization", () => {
  it("marks the value span and forwards contentClassName", async () => {
    const user = createUser()
    render(
      <DatePickerButton
        id="due"
        value="2026-10-05"
        onChange={() => {}}
        contentClassName="w-96"
      />
    )
    const value = slot("date-picker-value")
    expect(value.id).toBe("due-value")
    await user.click(screen.getByRole("button", { name: /^October 5/ }))
    await screen.findByRole("grid")
    expect(screen.getByRole("dialog").className).toContain("w-96")
  })

  it("passes calendarProps to Day Picker", async () => {
    const user = createUser()
    render(
      <DatePickerButton
        value="2026-10-05"
        onChange={() => {}}
        calendarProps={{
          weekStartsOn: 1,
          disabled: { before: new Date(2026, 9, 10) },
        }}
      />
    )
    await user.click(screen.getByRole("button", { name: /^October 5/ }))
    await screen.findByRole("grid")
    expect(firstWeekday()).toMatch(/monday/i)
    expect(getDayButton(new Date(2026, 9, 8))).toBeDisabled()
    expect(getDayButton(new Date(2026, 9, 12))).toBeEnabled()
  })

  it("marks the range footer", async () => {
    const user = createUser()
    render(
      <DatePickerButton
        mode="range"
        value={{ from: "2026-10-05", to: "2026-10-08" }}
        onChange={() => {}}
        defaultMonth={october}
        numberOfMonths={1}
        calendarProps={{ weekStartsOn: 1 }}
      />
    )
    await user.click(screen.getByRole("button", { name: /October 5/ }))
    await screen.findByRole("grid")
    expect(
      slot("date-picker-footer").querySelector("button")
    ).toHaveTextContent("Clear")
    expect(firstWeekday()).toMatch(/monday/i)
  })
})

describe("DateTimePickerButton customization", () => {
  it("marks its parts and forwards contentClassName and calendarProps", async () => {
    const user = createUser()
    render(
      <DateTimePickerButton
        id="start"
        value={new Date(2026, 9, 5, 9, 30)}
        onChange={() => {}}
        contentClassName="w-96"
        calendarProps={{ disabled: { dayOfWeek: [0, 6] } }}
      />
    )
    expect(slot("date-picker-value").id).toBe("start-value")
    await user.click(screen.getByRole("button", { name: /^October 5/ }))
    await screen.findByRole("grid")
    expect(screen.getByRole("dialog").className).toContain("w-96")
    expect(slot("date-time-picker-time")).toHaveAccessibleName("Time")
    expect(slot("date-picker-footer")).toHaveTextContent("Clear")
    // October 10, 2026 is a Saturday.
    expect(getDayButton(new Date(2026, 9, 10))).toBeDisabled()
  })
})

describe("form field customization", () => {
  it("styles the text field wrapper and control separately and marks its parts", () => {
    const field = fakeTextField("title", "", ["Required"])
    render(
      <FormTextField
        field={field}
        label="Title"
        description="Shown on the card"
        fieldClassName="max-w-sm"
        className="font-mono"
      />
    )
    const wrapper = slot("form-field")
    expect(wrapper.className).toContain("max-w-sm")
    expect(wrapper.className).toContain("flex-col")
    expect(screen.getByRole("textbox", { name: "Title" }).className).toContain(
      "font-mono"
    )
    expect(slot("form-field-description")).toHaveTextContent(
      "Shown on the card"
    )
    expect(slot("form-field-error")).toHaveTextContent("Required")
  })

  it("forwards className and slot on FieldError and FormFeedbackField", () => {
    render(
      <>
        <FieldError text="Bad" className="mt-2" />
        <FormFeedbackField message="Save failed" className="mb-4" />
      </>
    )
    const error = slot("form-field-error")
    expect(error.className).toContain("mt-2")
    expect(error.className).toContain("text-destructive")
    const feedback = slot("form-feedback")
    expect(feedback.className).toContain("mb-4")
    expect(feedback).toHaveTextContent("Save failed")
  })

  it("styles the select trigger, content, and wrapper", async () => {
    const user = createUser()
    render(
      <FormSelectField
        label="Status"
        value="open"
        onValueChange={() => {}}
        fieldClassName="w-48"
        className="font-mono"
        contentClassName="max-h-40"
      >
        <SelectItem value="open">Open</SelectItem>
        <SelectItem value="closed">Closed</SelectItem>
      </FormSelectField>
    )
    expect(slot("form-field").className).toContain("w-48")
    const trigger = screen.getByRole("combobox", { name: "Status" })
    expect(trigger.className).toContain("font-mono")
    await user.click(trigger)
    expect(
      (await screen.findByRole("listbox")).closest("[data-slot=select-content]")
        ?.className
    ).toContain("max-h-40")
  })

  it("styles the markdown textarea, preview, wrapper, and label row", async () => {
    const user = createUser()
    const field = fakeTextField("body", "**hi**")
    render(
      <FormMarkdownField
        field={field}
        label="Body"
        fieldClassName="max-w-prose"
        className="font-mono"
        previewClassName="min-h-40"
      />
    )
    expect(slot("form-field").className).toContain("max-w-prose")
    expect(slot("form-field-header")).toHaveTextContent("Body")
    expect(screen.getByRole("textbox", { name: "Body" }).className).toContain(
      "font-mono"
    )
    await user.click(screen.getByRole("radio", { name: "Preview" }))
    const preview = slot("form-markdown-preview")
    expect(preview.className).toContain("min-h-40")
    expect(preview.className).toContain("border-input")
  })

  it("styles the date field wrapper and forwards picker options", async () => {
    const user = createUser()
    render(
      <>
        <FormDatePickerField
          label="Due"
          value="2026-10-05"
          onValueChange={() => {}}
          meta={{ errors: ["Pick a weekday"] }}
          fieldClassName="max-w-xs"
          contentClassName="w-96"
          calendarProps={{ weekStartsOn: 1 }}
        />
        <FormDateTimePickerField
          label="Starts"
          value={null}
          onValueChange={() => {}}
          fieldClassName="max-w-sm"
          contentClassName="w-80"
        />
      </>
    )
    const [dateField, dateTimeField] = Array.from(
      document.querySelectorAll<HTMLElement>("[data-slot=form-field]")
    )
    expect(dateField?.className).toContain("max-w-xs")
    expect(dateTimeField?.className).toContain("max-w-sm")
    const trigger = screen.getByRole("button", { name: /^Due/ })
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    expect(trigger).toHaveAccessibleDescription("Pick a weekday")
    await user.click(trigger)
    await screen.findByRole("grid")
    expect(screen.getByRole("dialog").className).toContain("w-96")
    expect(firstWeekday()).toMatch(/monday/i)
  })
})

describe("date field aria", () => {
  it("names a date-time field trigger by label and value", () => {
    const onValueChange = vi.fn()
    render(
      <FormDateTimePickerField
        label="Starts"
        value={new Date(2026, 9, 5, 9, 30)}
        onValueChange={onValueChange}
      />
    )
    expect(
      screen.getByRole("button", { name: /^Starts October 5/ })
    ).not.toHaveAttribute("aria-invalid")
  })
})
