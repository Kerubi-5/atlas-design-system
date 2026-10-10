import { Label } from "../src/label.js"
import { RadioGroup, RadioGroupItem } from "../src/radio-group.js"
import { Switch } from "../src/switch.js"

/** Settings that apply immediately, with sentence-case labels. */
export function SwitchStory() {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Switch id="digest" defaultChecked />
        <Label htmlFor="digest">Send a weekly digest</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="beta" disabled />
        <Label htmlFor="beta">Beta features (admin only)</Label>
      </div>
    </div>
  )
}

/** One choice from a short visible list. */
export function RadioGroupStory() {
  return (
    <RadioGroup defaultValue="weekly" aria-label="Export frequency">
      {(
        [
          ["daily", "Daily"],
          ["weekly", "Weekly"],
          ["monthly", "Monthly"],
        ] as const
      ).map(([value, label]) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value} id={`frequency-${value}`} />
          <Label htmlFor={`frequency-${value}`}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}
