import { DatePickerButton } from "../src/date-picker.js"

/** Default range picker: one month below md, two at md+, viewport-clamped. */
export function DatePickerRangeStory() {
  return (
    <DatePickerButton
      mode="range"
      value={{ from: "2026-10-05", to: "2026-10-20" }}
      onChange={() => {}}
      placeholder="Export range"
    />
  )
}
