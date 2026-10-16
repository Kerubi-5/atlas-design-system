import { describe, expect, it } from "vitest"

import { FormControlField } from "../src/form/control-field.js"
import { FormDatePickerField } from "../src/form/date-picker-field.js"
import { FormDateTimePickerField } from "../src/form/date-time-picker-field.js"
import type { FieldMetaState } from "../src/form/field-error.js"
import { FormMarkdownField } from "../src/form/markdown-field.js"
import { FormSelectField } from "../src/form/select-field.js"
import { FormTextField } from "../src/form/text-field.js"
import { SelectItem } from "../src/select.js"
import { CustomControlFieldStory } from "../stories/fields.js"

import { render, screen } from "./helpers.js"

function textField(meta: FieldMetaState) {
  return {
    name: "amount",
    state: { value: "", meta },
    handleChange() {},
    handleBlur() {},
  }
}

const untouched = { errors: ["Enter an amount"], isTouched: false }
const touched = { errors: ["Enter an amount"], isTouched: true }

/**
 * Apps that validate the whole form on change get errors for every field
 * at once. A field shows its error only after the person has touched it or
 * tried to submit; without `isTouched` in meta it shows errors as before.
 */
describe("field error timing", () => {
  it("hides errors on an untouched field", () => {
    render(<FormTextField field={textField(untouched)} label="Amount" />)
    const input = screen.getByRole("textbox", { name: "Amount" })
    expect(input).not.toHaveAttribute("aria-invalid")
    expect(input).not.toHaveAttribute("aria-describedby")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("shows the error once the field is touched", () => {
    render(<FormTextField field={textField(touched)} label="Amount" />)
    const input = screen.getByRole("textbox", { name: "Amount" })
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAccessibleDescription("Enter an amount")
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an amount")
  })

  it("shows the error on an untouched field after submit", () => {
    render(
      <FormTextField field={textField(untouched)} label="Amount" submitted />
    )
    const input = screen.getByRole("textbox", { name: "Amount" })
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAccessibleDescription("Enter an amount")
  })

  it("keeps today's behavior when meta has no isTouched", () => {
    render(
      <FormTextField
        field={textField({ errors: ["Enter an amount"] })}
        label="Amount"
      />
    )
    expect(screen.getByRole("textbox", { name: "Amount" })).toHaveAttribute(
      "aria-invalid",
      "true"
    )
  })

  it("lets showError={false} hide a touched or submitted error", () => {
    render(
      <FormTextField
        field={textField(touched)}
        label="Amount"
        submitted
        showError={false}
      />
    )
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("gates the markdown, select, and date fields the same way", () => {
    const { rerender } = render(
      <>
        <FormMarkdownField field={textField(untouched)} label="Notes" />
        <FormSelectField
          value="a"
          onValueChange={() => {}}
          meta={untouched}
          label="Kind"
        >
          <SelectItem value="a">A</SelectItem>
        </FormSelectField>
        <FormDatePickerField
          value={undefined}
          onValueChange={() => {}}
          meta={untouched}
          label="Day"
        />
        <FormDateTimePickerField
          value={null}
          onValueChange={() => {}}
          meta={untouched}
          label="Starts"
        />
      </>
    )
    expect(screen.queryAllByRole("alert")).toHaveLength(0)

    rerender(
      <>
        <FormMarkdownField
          field={textField(untouched)}
          label="Notes"
          submitted
        />
        <FormSelectField
          value="a"
          onValueChange={() => {}}
          meta={untouched}
          label="Kind"
          submitted
        >
          <SelectItem value="a">A</SelectItem>
        </FormSelectField>
        <FormDatePickerField
          value={undefined}
          onValueChange={() => {}}
          meta={touched}
          label="Day"
        />
        <FormDateTimePickerField
          value={null}
          onValueChange={() => {}}
          meta={untouched}
          label="Starts"
          submitted
        />
      </>
    )
    expect(screen.getAllByRole("alert")).toHaveLength(4)
  })
})

describe("FormControlField", () => {
  it("wires label, required marker, hint, and error to a custom control", () => {
    render(
      <FormControlField
        id="currency"
        label="Currency"
        description="ISO code"
        required
        meta={touched}
      >
        {(control) => <input {...control} />}
      </FormControlField>
    )
    const input = screen.getByRole("textbox", { name: "Currency" })
    expect(input).toHaveAttribute("id", "currency")
    expect(input).toHaveAttribute("aria-required", "true")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAttribute(
      "aria-describedby",
      "currency-description currency-error"
    )
    expect(input).toHaveAccessibleDescription("ISO code Enter an amount")
    expect(document.getElementById("currency-label")).toHaveTextContent(
      "Currency"
    )
    expect(
      document.querySelector('[data-slot="label-required"]')
    ).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveAttribute("id", "currency-error")
    expect(
      input.closest('[data-slot="form-field"]')?.className.split(" ")
    ).toEqual(expect.arrayContaining(["flex", "flex-col", "gap-1.5"]))
  })

  it("follows the same error timing and generates an id", () => {
    render(
      <FormControlField label="Currency" meta={untouched}>
        {(control) => <input {...control} />}
      </FormControlField>
    )
    const input = screen.getByRole("textbox", { name: "Currency" })
    expect(input.id).not.toBe("")
    expect(input).not.toHaveAttribute("aria-invalid")
    expect(input).not.toHaveAttribute("aria-required")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("passes className, rest props, and the error to the wrapper", () => {
    render(
      <FormControlField
        label="Currency"
        meta={{ errors: [{ message: "Pick one" }] }}
        className="w-40"
        data-testid="wrapper"
      >
        {(control) => <input {...control} />}
      </FormControlField>
    )
    expect(screen.getByTestId("wrapper")).toHaveClass("w-40")
    expect(screen.getByTestId("wrapper")).toHaveAttribute(
      "data-slot",
      "form-field"
    )
    expect(screen.getByRole("alert")).toHaveTextContent("Pick one")
  })
})

describe("custom control story", () => {
  it("renders a text field error beside a labelled combobox", () => {
    render(<CustomControlFieldStory />)
    expect(screen.getByRole("textbox", { name: "Amount" })).toHaveAttribute(
      "aria-invalid",
      "true"
    )
    const currency = screen.getByRole("combobox", { name: /Currency/ })
    expect(currency).toHaveAttribute("aria-required", "true")
    expect(
      currency.closest('[data-slot="form-field"]')?.parentElement
    ).toHaveClass("items-start")
  })
})
