import { describe, expect, it, vi } from "vitest"

import { FormSelectField } from "../src/form/select-field.js"
import { SelectItem } from "../src/select.js"

import { createUser, render, screen } from "./helpers.js"

describe("FormSelectField", () => {
  it("labels the select, marks it invalid, and reports the chosen value", async () => {
    const user = createUser()
    const onValueChange = vi.fn()
    render(
      <FormSelectField
        label="Currency"
        value={undefined}
        placeholder="Pick a currency"
        meta={{ errors: ["Choose a currency"] }}
        onValueChange={onValueChange}
      >
        <SelectItem value="usd">US Dollar</SelectItem>
        <SelectItem value="eur">Euro</SelectItem>
      </FormSelectField>
    )
    const trigger = screen.getByRole("combobox", { name: "Currency" })
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a currency")
    await user.click(trigger)
    await user.click(await screen.findByRole("option", { name: "Euro" }))
    expect(onValueChange).toHaveBeenCalledWith("eur")
  })

  it("stays valid without meta or when meta has no errors", () => {
    const { rerender } = render(
      <FormSelectField
        value={undefined}
        label="Plan"
        placeholder="Pick a plan"
        onValueChange={() => {}}
      >
        <SelectItem value="free">Free</SelectItem>
      </FormSelectField>
    )
    const trigger = screen.getByRole("combobox", { name: "Plan" })
    expect(trigger).not.toHaveAttribute("aria-invalid")
    expect(trigger).not.toHaveAttribute("aria-describedby")
    expect(trigger).toHaveTextContent("Pick a plan")
    expect(screen.queryByRole("alert")).toBeNull()

    rerender(
      <FormSelectField
        value="free"
        meta={{ errors: [] }}
        label="Plan"
        onValueChange={() => {}}
      >
        <SelectItem value="free">Free</SelectItem>
      </FormSelectField>
    )
    expect(screen.getByRole("combobox", { name: "Plan" })).not.toHaveAttribute(
      "aria-invalid"
    )
  })

  it("marks the trigger invalid and shows the first error", () => {
    render(
      <FormSelectField
        value=""
        meta={{ errors: ["Choose a plan"] }}
        label="Plan"
        onValueChange={() => {}}
      >
        <SelectItem value="free">Free</SelectItem>
      </FormSelectField>
    )
    const trigger = screen.getByRole("combobox", { name: "Plan" })
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    // WCAG 1.3.1 / 3.3.1: the error is the trigger's description.
    expect(trigger).toHaveAccessibleDescription("Choose a plan")
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a plan")
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
})
