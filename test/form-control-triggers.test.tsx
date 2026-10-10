import { describe, expect, it } from "vitest"

import { Combobox } from "../src/combobox.js"
import { DatePickerButton } from "../src/date-picker.js"
import { DateTimePickerButton } from "../src/date-time-picker.js"
import { FormDatePickerField } from "../src/form/date-picker-field.js"
import { FormDateTimePickerField } from "../src/form/date-time-picker-field.js"
import { formControlTriggerClassName } from "../src/internal/form-control.js"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/select.js"
import { FormControlTriggersStory } from "../stories/form-control-triggers.js"

import {
  expectFormControlTrigger,
  formControlTriggerTokens,
  render,
  screen,
} from "./helpers.js"

describe("form-control trigger chrome", () => {
  it("shares Input-matching tokens across DatePicker, DateTimePicker, Combobox, and Select", () => {
    for (const token of formControlTriggerTokens) {
      expect(formControlTriggerClassName.split(/\s+/)).toContain(token)
    }

    render(<FormControlTriggersStory />)

    expectFormControlTrigger(screen.getByLabelText("Plain input"))
    expectFormControlTrigger(screen.getByRole("button", { name: /^October 9/ }))
    expectFormControlTrigger(
      screen.getByRole("button", { name: /^October 10/ })
    )
    const combobox = screen
      .getAllByRole("combobox")
      .find((node) => node.getAttribute("data-slot") === "popover-trigger")
    expect(combobox).toBeTruthy()
    expectFormControlTrigger(combobox as HTMLElement)

    const selectTrigger = screen.getByLabelText("Select trigger")
    for (const token of [
      "px-3",
      "text-base",
      "md:text-sm",
      "border-input",
      "bg-background",
      "shadow-xs",
    ]) {
      expect(selectTrigger.className.split(/\s+/)).toContain(token)
    }
    expect(selectTrigger.className.split(/\s+/)).toContain(
      "data-[size=default]:h-10"
    )
  })

  it("keeps consumer className workarounds on DatePicker, DateTimePicker, and Combobox", () => {
    render(
      <>
        <DatePickerButton
          value="2026-10-09"
          onChange={() => {}}
          className="px-3 text-sm"
        />
        <DateTimePickerButton
          value={new Date(2026, 9, 10, 14, 30)}
          onChange={() => {}}
          className="px-3 text-sm"
        />
        <Combobox
          options={[{ value: "usd", label: "US Dollar" }]}
          value="usd"
          onValueChange={() => {}}
          className="px-3 text-sm"
        />
      </>
    )

    const dateTrigger = screen.getByRole("button", { name: /^October 9/ })
    const dateTimeTrigger = screen.getByRole("button", { name: /^October 10/ })
    const combobox = screen.getByRole("combobox")
    expect(dateTrigger.className.split(/\s+/)).toContain("px-3")
    expect(dateTrigger.className.split(/\s+/)).toContain("text-sm")
    expect(dateTrigger.className.split(/\s+/)).toContain("hover:bg-background")
    expect(dateTrigger.className.split(/\s+/)).not.toContain(
      "hover:bg-selected"
    )
    expect(dateTimeTrigger.className.split(/\s+/)).toContain("px-3")
    expect(dateTimeTrigger.className.split(/\s+/)).toContain("text-sm")
    expect(dateTimeTrigger.className.split(/\s+/)).toContain(
      "hover:bg-background"
    )
    expect(combobox.className.split(/\s+/)).toContain("px-3")
    expect(combobox.className.split(/\s+/)).toContain("text-sm")
    expect(combobox.className.split(/\s+/)).toContain("hover:bg-background")
  })

  it("forwards FormDatePickerField className to the trigger", () => {
    render(
      <FormDatePickerField
        value="2026-10-09"
        onValueChange={() => {}}
        label="Due"
        className="w-40"
      />
    )

    const trigger = screen.getByLabelText("Due")
    expect(trigger.className.split(/\s+/)).toContain("w-40")
    expectFormControlTrigger(trigger)
  })

  it("forwards FormDateTimePickerField className to the trigger", () => {
    render(
      <FormDateTimePickerField
        value={new Date(2026, 9, 10, 14, 30)}
        onValueChange={() => {}}
        label="Starts"
        className="w-40"
      />
    )

    const trigger = screen.getByLabelText("Starts")
    expect(trigger.className.split(/\s+/)).toContain("w-40")
    expectFormControlTrigger(trigger)
  })

  it("keeps SelectTrigger on the Input type scale", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Size check">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByLabelText("Size check")
    expect(trigger.className.split(/\s+/)).toContain("text-base")
    expect(trigger.className.split(/\s+/)).toContain("md:text-sm")
    expect(trigger.className.split(/\s+/)).not.toContain("text-sm")
  })
})
