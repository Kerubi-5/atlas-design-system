import { useState } from "react"

import { Input } from "../src/input.js"
import { Label } from "../src/label.js"
import { Textarea } from "../src/textarea.js"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../src/field.js"
import { FormDatePickerField } from "../src/form/date-picker-field.js"
import { FormDateTimePickerField } from "../src/form/date-time-picker-field.js"
import { FormMarkdownField } from "../src/form/markdown-field.js"
import { FieldError } from "../src/form/field-error.js"
import { FormFeedbackField } from "../src/form/feedback-field.js"
import { FormSelectField } from "../src/form/select-field.js"
import { FormTextField, type TextFieldApi } from "../src/form/text-field.js"
import { SelectItem } from "../src/select.js"

/**
 * Local TextFieldApi stand-in so form stories do not pull in a form library.
 */
function useDemoField(name: string, initial = ""): TextFieldApi {
  const [value, setValue] = useState(initial)
  return {
    name,
    state: { value, meta: { errors: [] } },
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
      <FormTextField field={name} label="Name" description="Shown on exports" />
      <FormMarkdownField field={notes} label="Notes" rows={4} />
      <FormSelectField
        label="Currency"
        value={currency}
        onValueChange={setCurrency}
      >
        <SelectItem value="usd">US Dollar</SelectItem>
        <SelectItem value="eur">Euro</SelectItem>
      </FormSelectField>
      <FormDatePickerField
        label="As of"
        value={date}
        onValueChange={setDate}
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
