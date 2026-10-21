import { Combobox } from "../src/combobox.js"
import { DatePickerButton } from "../src/date-picker.js"
import { DateTimePickerButton } from "../src/date-time-picker.js"
import { Input } from "../src/input.js"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/select.js"

export const formControlOptions = [
  { value: "usd", label: "US Dollar" },
  { value: "eur", label: "Euro" },
]

/** `formControlOptions` as `SelectItem`s. */
export const formControlSelectItems = formControlOptions.map((option) => (
  <SelectItem key={option.value} value={option.value}>
    {option.label}
  </SelectItem>
))

/** The option values plus `""` (none), for a Storybook select control. */
export const formControlValues = [
  "",
  ...formControlOptions.map((option) => option.value),
]

/**
 * App-side ISO 4217-style check for Combobox's `normalizeCreateValue`: three
 * letters, normalized to uppercase. The kit does not own currency catalogs.
 */
export const iso4217Code = (query: string) => {
  const code = query.trim().toUpperCase()
  return /^[A-Z]{3}$/.test(code) ? code : null
}

/**
 * Side-by-side Input, SelectTrigger, DatePickerButton, DateTimePickerButton,
 * and Combobox. Used by kit tests and visual captures so form chrome stays
 * aligned.
 */
export function FormControlTriggersStory() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Input defaultValue="October 9, 2026" aria-label="Plain input" />
      <Select defaultValue="usd">
        <SelectTrigger aria-label="Select trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{formControlSelectItems}</SelectContent>
      </Select>
      <DatePickerButton value="2026-10-09" onValueChange={() => {}} />
      <DateTimePickerButton
        value={new Date(2026, 9, 10, 14, 30)}
        onValueChange={() => {}}
      />
      <Combobox
        options={formControlOptions}
        value="usd"
        onValueChange={() => {}}
        aria-label="Combobox trigger"
      />
    </div>
  )
}
