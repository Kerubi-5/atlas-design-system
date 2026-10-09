import { Combobox } from "../src/combobox.js"
import { DatePickerButton } from "../src/date-picker.js"
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

/**
 * Side-by-side Input, SelectTrigger, DatePickerButton, and Combobox.
 * Used by kit tests and visual captures so form chrome stays aligned.
 */
export function FormControlTriggersStory() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Input defaultValue="October 9, 2026" aria-label="Plain input" />
      <Select defaultValue="usd">
        <SelectTrigger aria-label="Select trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="usd">US Dollar</SelectItem>
          <SelectItem value="eur">Euro</SelectItem>
        </SelectContent>
      </Select>
      <DatePickerButton value="2026-10-09" onChange={() => {}} />
      <Combobox
        options={formControlOptions}
        value="usd"
        onValueChange={() => {}}
      />
    </div>
  )
}
