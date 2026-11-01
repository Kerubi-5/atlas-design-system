import { describe, expect, it, vi } from "vitest"

import {
  FormCheckboxField,
  FormCheckboxGroupField,
} from "../src/form/checkbox-field.js"
import { FormComboboxField } from "../src/form/combobox-field.js"
import { FormToggleGroupField } from "../src/form/toggle-group-field.js"

import { createUser, render, screen } from "./helpers.js"

const error = { errors: ["Pick one"], isTouched: true }
const untouched = { errors: ["Pick one"], isTouched: false }

describe("FormCheckboxField", () => {
  it("toggles a boolean and reads its hint with the checkbox", async () => {
    const user = createUser()
    const onCheckedChange = vi.fn()
    render(
      <FormCheckboxField
        label="Repeat"
        description="Auto-create on schedule"
        checked={false}
        onCheckedChange={onCheckedChange}
        controlPosition="end"
        fieldClassName="px-0"
      />
    )
    const box = screen.getByRole("checkbox", { name: "Repeat" })
    expect(box).toHaveAccessibleDescription("Auto-create on schedule")
    await user.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    const field = document.querySelector('[data-slot="form-field"]')!
    expect(field).toHaveClass("px-0")
    // The checkbox trails the label and hint.
    expect(field.querySelector('[data-slot="field"]')!.lastElementChild).toBe(
      box
    )
  })

  it("leads with the checkbox, reports false, and shows errors once touched", async () => {
    const user = createUser()
    const onCheckedChange = vi.fn()
    const { rerender } = render(
      <FormCheckboxField
        label="All day"
        checked
        onCheckedChange={onCheckedChange}
        meta={untouched}
        className="size-5"
      />
    )
    const box = screen.getByRole("checkbox", { name: "All day" })
    expect(box).toHaveClass("size-5")
    expect(box).not.toHaveAttribute("aria-invalid")
    await user.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(false)

    rerender(
      <FormCheckboxField
        label="All day"
        checked
        onCheckedChange={onCheckedChange}
        meta={error}
        required
      />
    )
    expect(box).toHaveAttribute("aria-invalid", "true")
    expect(box).toHaveAttribute("aria-required", "true")
    expect(box).toHaveAccessibleDescription("Pick one")
  })
})

describe("FormCheckboxGroupField", () => {
  it("adds and removes values in option order", async () => {
    const user = createUser()
    const onValueChange = vi.fn()
    const options = [5, 15, 30].map((m) => ({ value: m, label: `${m} min` }))
    const { rerender } = render(
      <FormCheckboxGroupField
        label="Reminders"
        description="Minutes before"
        options={options}
        value={[30]}
        onValueChange={onValueChange}
        className="grid grid-cols-2"
      />
    )
    const group = screen.getByRole("group", { name: "Reminders" })
    expect(group).toHaveAccessibleDescription("Minutes before")
    expect(
      group.querySelector('[data-slot="form-checkbox-group-options"]')
    ).toHaveClass("grid", "grid-cols-2")
    await user.click(screen.getByRole("checkbox", { name: "5 min" }))
    expect(onValueChange).toHaveBeenLastCalledWith([5, 30])

    rerender(
      <FormCheckboxGroupField
        label="Reminders"
        options={options}
        value={[5, 30]}
        onValueChange={onValueChange}
        meta={error}
      />
    )
    await user.click(screen.getByRole("checkbox", { name: "30 min" }))
    expect(onValueChange).toHaveBeenLastCalledWith([5])
    expect(screen.getByRole("group", { name: "Reminders" })).toHaveAttribute(
      "aria-invalid",
      "true"
    )
    expect(screen.getByText("Pick one")).toBeInTheDocument()
  })
})

describe("FormToggleGroupField", () => {
  it("exposes the required state on the radio group", () => {
    const props = {
      label: "Type",
      value: "",
      onValueChange: vi.fn(),
      options: [{ value: "a", label: "A" }],
    }
    const { rerender } = render(<FormToggleGroupField {...props} required />)
    expect(screen.getByRole("radiogroup", { name: "Type" })).toHaveAttribute(
      "aria-required",
      "true"
    )
    rerender(<FormToggleGroupField {...props} />)
    expect(
      screen.getByRole("radiogroup", { name: "Type" })
    ).not.toHaveAttribute("aria-required")
  })

  it("is labelled by its label and ignores deselecting the active item", async () => {
    const user = createUser()
    const onValueChange = vi.fn()
    render(
      <FormToggleGroupField
        label="Split the target"
        value="equal"
        onValueChange={onValueChange}
        options={[
          { value: "equal", label: "Equal" },
          { value: "custom", label: "Custom %" },
        ]}
        description="How members share it"
        size="sm"
        className="w-full"
      />
    )
    const group = screen.getByRole("radiogroup", { name: "Split the target" })
    expect(group).toHaveAccessibleDescription("How members share it")
    expect(group).toHaveClass("w-full")
    await user.click(screen.getByRole("radio", { name: "Equal" }))
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole("radio", { name: "Custom %" }))
    expect(onValueChange).toHaveBeenCalledWith("custom")
  })

  it("marks the group invalid with an error", () => {
    render(
      <FormToggleGroupField
        label="Type"
        value=""
        onValueChange={vi.fn()}
        options={[{ value: "a", label: "A" }]}
        meta={error}
      />
    )
    expect(screen.getByRole("radiogroup", { name: "Type" })).toHaveAttribute(
      "aria-invalid",
      "true"
    )
    expect(
      screen.getByRole("radiogroup", { name: "Type" })
    ).toHaveAccessibleDescription("Pick one")
  })
})

describe("FormComboboxField", () => {
  it("labels the combobox, picks an option, and blurs the field", async () => {
    const user = createUser()
    const onValueChange = vi.fn()
    const onBlur = vi.fn()
    render(
      <FormComboboxField
        label="Currency"
        value="USD"
        onValueChange={onValueChange}
        onBlur={onBlur}
        options={[
          { value: "USD", label: "US dollar" },
          { value: "PHP", label: "Philippine peso" },
        ]}
        meta={untouched}
        required
        fieldClassName="max-w-xs"
      />
    )
    const trigger = screen.getByRole("combobox", { name: "Currency" })
    expect(trigger).toHaveTextContent("US dollar")
    expect(trigger).toHaveAttribute("aria-required", "true")
    expect(trigger).not.toHaveAttribute("aria-invalid")
    expect(document.querySelector('[data-slot="form-field"]')).toHaveClass(
      "max-w-xs"
    )
    await user.click(trigger)
    await user.click(screen.getByRole("option", { name: "Philippine peso" }))
    expect(onValueChange).toHaveBeenCalledWith("PHP")
  })

  it("shows the error once touched", () => {
    render(
      <FormComboboxField
        label="Currency"
        value=""
        onValueChange={vi.fn()}
        options={[]}
        meta={error}
      />
    )
    const trigger = screen.getByRole("combobox", { name: "Currency" })
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    expect(trigger).toHaveAccessibleDescription("Pick one")
  })
})
