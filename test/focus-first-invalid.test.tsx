import { describe, expect, it } from "vitest"

import { FormComboboxField } from "../src/form/combobox-field.js"
import { focusFirstInvalid } from "../src/form/focus-first-invalid.js"
import { FormSelectField } from "../src/form/select-field.js"
import { FormTextField } from "../src/form/text-field.js"
import { SelectItem } from "../src/select.js"

import { FormToggleGroupField } from "../src/form/toggle-group-field.js"

import { fakeTextField, render, screen } from "./helpers.js"

/** An invalid-submit event whose fields with `errors` are the invalid ones. */
function invalidSubmit(fieldMeta: Record<string, { errors: string[] }>) {
  return { formApi: { state: { fieldMeta } } }
}

function OrderForm() {
  return (
    <form id="order">
      <FormTextField field={fakeTextField("amount", "")} label="Amount" />
      <FormSelectField
        fieldName="currency"
        label="Currency"
        value={undefined}
        onValueChange={() => {}}
      >
        <SelectItem value="php">Philippine peso</SelectItem>
      </FormSelectField>
    </form>
  )
}

describe("focusFirstInvalid", () => {
  it("continues past disabled and hidden invalid controls", () => {
    render(
      <form id="order">
        <input aria-label="Disabled" data-field-name="disabled" disabled />
        <input type="hidden" data-field-name="hidden" />
        <input aria-label="Available" data-field-name="available" />
        <button type="submit">Save</button>
      </form>
    )
    screen.getByRole("button", { name: "Save" }).focus()
    focusFirstInvalid("order")(
      invalidSubmit({
        disabled: { errors: ["Invalid"] },
        hidden: { errors: ["Invalid"] },
        available: { errors: ["Invalid"] },
      })
    )
    expect(screen.getByRole("textbox", { name: "Available" })).toHaveFocus()
  })

  it("accepts focus that a radio group moves to its selected option", () => {
    render(
      <form id="order">
        <FormToggleGroupField
          fieldName="type"
          label="Type"
          value="a"
          onValueChange={() => {}}
          options={[{ value: "a", label: "A" }]}
        />
        <input aria-label="Later" data-field-name="later" />
      </form>
    )
    focusFirstInvalid("order")(
      invalidSubmit({
        type: { errors: ["Invalid"] },
        later: { errors: ["Invalid"] },
      })
    )
    expect(screen.getByRole("radio", { name: "A" })).toHaveFocus()
  })

  it("focuses the first invalid field in page order", () => {
    render(<OrderForm />)
    focusFirstInvalid("order")(
      invalidSubmit({
        amount: { errors: ["Enter an amount"] },
        currency: { errors: ["Pick a currency"] },
      })
    )
    expect(screen.getByLabelText("Amount")).toHaveFocus()
  })

  it("skips valid fields, so a select can be the target", () => {
    render(<OrderForm />)
    focusFirstInvalid("order")(
      invalidSubmit({
        amount: { errors: [] },
        currency: { errors: ["Pick a currency"] },
      })
    )
    expect(screen.getByRole("combobox", { name: "Currency" })).toHaveFocus()
  })

  it("moves nothing when no field has errors", () => {
    render(<OrderForm />)
    focusFirstInvalid("order")(
      invalidSubmit({ amount: { errors: [] }, currency: { errors: [] } })
    )
    expect(document.body).toHaveFocus()
  })

  it("moves nothing when the form id matches no form", () => {
    render(<OrderForm />)
    expect(() =>
      focusFirstInvalid("missing")(
        invalidSubmit({ amount: { errors: ["Enter an amount"] } })
      )
    ).not.toThrow()
    expect(document.body).toHaveFocus()
  })

  it("reaches a combobox, and stays inside the form that submitted", () => {
    const countries = [
      { value: "ph", label: "Philippines" },
      { value: "sg", label: "Singapore" },
    ]
    render(
      <>
        <form id="shipping">
          <FormComboboxField
            fieldName="country"
            label="Shipping country"
            options={countries}
            onValueChange={() => {}}
          />
        </form>
        <form id="billing">
          <FormTextField field={fakeTextField("name", "")} label="Name" />
          <FormComboboxField
            fieldName="country"
            label="Billing country"
            options={countries}
            onValueChange={() => {}}
          />
        </form>
      </>
    )
    focusFirstInvalid("billing")(
      invalidSubmit({
        name: { errors: [] },
        country: { errors: ["Pick a country"] },
      })
    )
    expect(
      screen.getByRole("combobox", { name: "Billing country" })
    ).toHaveFocus()
  })
})
