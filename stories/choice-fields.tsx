import * as React from "react"

import {
  FormCheckboxField,
  FormCheckboxGroupField,
} from "../src/form/checkbox-field.js"
import { FormComboboxField } from "../src/form/combobox-field.js"
import { FormToggleGroupField } from "../src/form/toggle-group-field.js"

const reminderOptions = [5, 15, 30, 60].map((minute) => ({
  value: minute,
  label: `${minute} min`,
}))

const currencies = [
  { value: "USD", label: "$ USD · US dollar" },
  { value: "EUR", label: "€ EUR · Euro" },
  { value: "PHP", label: "₱ PHP · Philippine peso" },
]

/** Checkbox, checkbox group, toggle group, and combobox fields in one form. */
export function ChoiceFieldsStory() {
  const [repeat, setRepeat] = React.useState(true)
  const [reminders, setReminders] = React.useState([15])
  const [type, setType] = React.useState<"expense" | "income">("expense")
  const [currency, setCurrency] = React.useState("USD")
  return (
    <form className="grid max-w-md gap-4">
      <FormToggleGroupField
        label="Type"
        value={type}
        onValueChange={setType}
        options={[
          { value: "expense", label: "Expense" },
          { value: "income", label: "Income" },
        ]}
      />
      <FormComboboxField
        label="Currency"
        value={currency}
        onValueChange={setCurrency}
        options={currencies}
        searchPlaceholder="Search currency…"
      />
      <FormCheckboxField
        label="Repeat"
        description="Auto-create on schedule"
        checked={repeat}
        onCheckedChange={setRepeat}
        controlPosition="end"
      />
      <FormCheckboxGroupField
        label="Push reminders (minutes before)"
        options={reminderOptions}
        value={reminders}
        onValueChange={setReminders}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      />
    </form>
  )
}
