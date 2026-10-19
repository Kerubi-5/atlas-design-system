import { describe, expect, it } from "vitest"

import { FormDatePickerField } from "../src/form/date-picker-field.js"
import { FormDateTimePickerField } from "../src/form/date-time-picker-field.js"
import { focusFirstInvalid } from "../src/form/focus-first-invalid.js"
import { FormSelectField } from "../src/form/select-field.js"
import { FormTextField } from "../src/form/text-field.js"
import { SelectItem } from "../src/select.js"

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
        id="currency"
        label="Currency"
        value={undefined}
        onValueChange={() => {}}
      >
        <SelectItem value="php">Philippine peso</SelectItem>
      </FormSelectField>
    </form>
  )
}

describe("form field ids", () => {
  it("puts the given id on the select trigger", () => {
    render(
      <FormSelectField
        id="currency"
        label="Currency"
        value={undefined}
        onValueChange={() => {}}
      >
        <SelectItem value="php">Philippine peso</SelectItem>
      </FormSelectField>
    )
    const trigger = screen.getByRole("combobox", { name: "Currency" })
    expect(trigger).toHaveAttribute("id", "currency")
    expect(screen.getByText("Currency")).toHaveAttribute("for", "currency")
  })

  it("puts the given id on the date picker trigger", () => {
    render(
      <FormDatePickerField
        id="due"
        label="Due"
        value={undefined}
        onValueChange={() => {}}
      />
    )
    expect(screen.getByLabelText("Due")).toHaveAttribute("id", "due")
  })

  it("puts the given id on the date-time picker trigger", () => {
    render(
      <FormDateTimePickerField
        id="starts"
        label="Starts"
        value={null}
        onValueChange={() => {}}
      />
    )
    expect(screen.getByLabelText("Starts")).toHaveAttribute("id", "starts")
  })

  it("still generates an id when none is given", () => {
    render(
      <FormSelectField
        label="Currency"
        value={undefined}
        onValueChange={() => {}}
      >
        <SelectItem value="php">Philippine peso</SelectItem>
      </FormSelectField>
    )
    const trigger = screen.getByRole("combobox", { name: "Currency" })
    expect(trigger.id).not.toBe("")
  })
})

describe("focusFirstInvalid", () => {
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

  it("skips valid fields, so a select named by id can be the target", () => {
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
})
