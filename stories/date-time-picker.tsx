import { DateTimePickerButton } from "../src/date-time-picker.js"

/** Fixed date-time picker for responsive layout checks at desktop and 390px. */
export function DateTimePickerStory() {
  return (
    <DateTimePickerButton
      value={new Date(2026, 9, 10, 14, 30)}
      onChange={() => {}}
      timeStep={15}
      placeholder="Pick a date and time"
    />
  )
}
