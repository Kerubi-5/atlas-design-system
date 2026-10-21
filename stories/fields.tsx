import { useState } from "react"

import { Button } from "../src/button.js"
import { Input } from "../src/input.js"
import { Label } from "../src/label.js"
import { Textarea } from "../src/textarea.js"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../src/field.js"
import { Combobox } from "../src/combobox.js"
import { FormControlField } from "../src/form/control-field.js"
import { FormDatePickerField } from "../src/form/date-picker-field.js"
import { FormDateTimePickerField } from "../src/form/date-time-picker-field.js"
import { FormMarkdownField } from "../src/form/markdown-field.js"
import { FieldError, type FieldMetaState } from "../src/form/field-error.js"
import { FormFeedbackField } from "../src/form/feedback-field.js"
import { focusFirstInvalid } from "../src/form/focus-first-invalid.js"
import { FormSelectField } from "../src/form/select-field.js"
import { FormTextField, type TextFieldApi } from "../src/form/text-field.js"
import { SelectItem } from "../src/select.js"

import {
  formControlOptions,
  formControlSelectItems,
} from "./form-control-triggers.js"

/**
 * Local TextFieldApi stand-in so form stories do not pull in a form library.
 */
export const useDemoField = (
  name: string,
  initial = "",
  meta: FieldMetaState = { errors: [] }
): TextFieldApi => {
  const [value, setValue] = useState(initial)
  return {
    name,
    state: { value, meta },
    handleChange: setValue,
    handleBlur() {},
  }
}

/** Label, input, and textarea as stacked fields. */
export function LabelInputTextareaStory() {
  return (
    <div className="grid max-w-md gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" defaultValue="Q4 export" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" defaultValue="Include last month." rows={3} />
      </div>
    </div>
  )
}

/** Field primitive with description. */
export function FieldStory() {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="owner">Owner</FieldLabel>
        <Input id="owner" defaultValue="Atlas" />
        <FieldDescription>Who receives the digest.</FieldDescription>
      </Field>
    </FieldGroup>
  )
}

/** Portable form helpers, including an error and form-level feedback. */
export function FormHelpersStory() {
  const name = useDemoField("name", "Atlas")
  const notes = useDemoField("notes", "Use **bold** for emphasis.")
  const [currency, setCurrency] = useState("usd")
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 9))
  const [dateTime, setDateTime] = useState<Date | null>(
    new Date(2026, 9, 9, 14, 30)
  )

  return (
    <div className="grid max-w-md gap-4">
      <FormTextField
        field={name}
        label="Name"
        description="Shown on exports"
        required
      />
      <FormMarkdownField field={notes} label="Notes" rows={4} />
      <FormSelectField
        label="Currency"
        value={currency}
        onValueChange={setCurrency}
      >
        {formControlSelectItems}
      </FormSelectField>
      <FormDatePickerField
        label="As of"
        value={date}
        onValueChange={setDate}
        required
        placeholder="Pick a date"
      />
      <FormDateTimePickerField
        label="Starts"
        value={dateTime}
        onValueChange={setDateTime}
        placeholder="Pick a date and time"
      />
      <FieldError message="This name is already taken." />
      <FormFeedbackField message="Could not save. Try again." />
    </div>
  )
}

/**
 * A failed submit focuses the first field with an error, in page order,
 * through `focusFirstInvalid`. Each field carries its field name
 * (`data-field-name`) so the handler can find it inside the form; errors
 * show once the form is submitted.
 */
export function FocusFirstInvalidStory() {
  const [submitted, setSubmitted] = useState(false)
  const amountValue = useDemoField("amount", "")
  const amount: TextFieldApi = {
    ...amountValue,
    state: {
      ...amountValue.state,
      meta: {
        errors: amountValue.state.value ? [] : ["Enter an amount"],
        isTouched: false,
      },
    },
  }
  const [currency, setCurrency] = useState<string | undefined>()
  const currencyMeta: FieldMetaState = {
    errors: currency ? [] : ["Pick a currency"],
    isTouched: false,
  }
  const fieldMeta = {
    amount: { errors: amount.state.meta.errors },
    currency: { errors: currencyMeta.errors },
  }
  const focusInvalid = focusFirstInvalid("focus-first-invalid-form")

  return (
    <form
      id="focus-first-invalid-form"
      noValidate
      className="grid max-w-md gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(true)
        focusInvalid({ formApi: { state: { fieldMeta } } })
      }}
    >
      <FormTextField
        field={amount}
        label="Amount"
        submitted={submitted}
        required
      />
      <FormSelectField
        fieldName="currency"
        label="Currency"
        value={currency}
        onValueChange={setCurrency}
        meta={currencyMeta}
        submitted={submitted}
        required
      >
        <SelectItem value="usd">US Dollar</SelectItem>
        <SelectItem value="php">Philippine peso</SelectItem>
      </FormSelectField>
      <div>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}

/**
 * A kit field and a custom control (`Combobox` in `FormControlField`) in one
 * row. `items-start` keeps both controls on the same top edge when only one
 * field shows an error, and the error takes no space until it appears.
 */
export function CustomControlFieldStory() {
  const amount = useDemoField("amount", "12,5", {
    errors: ["Enter a number"],
    isTouched: true,
  })
  const [currency, setCurrency] = useState("usd")

  return (
    <div className="grid max-w-md grid-cols-2 items-start gap-3">
      <FormTextField field={amount} label="Amount" required />
      <FormControlField label="Currency" required>
        {(control) => (
          <Combobox
            {...control}
            options={formControlOptions}
            value={currency}
            onValueChange={setCurrency}
          />
        )}
      </FormControlField>
    </div>
  )
}
