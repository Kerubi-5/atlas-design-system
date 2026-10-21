"use client"

import { DateTimePickerButton } from "../date-time-picker.js"

import { FormPickerField, type PickerFieldBaseProps } from "./field-shell.js"

type Props = PickerFieldBaseProps & {
  /** The picked instant, or `null` when empty. */
  value: Date | null
  /** Called with the picked instant, or `null` on Clear. */
  onValueChange: (date: Date | null) => void
  /** Trigger text while nothing is picked. Default "Pick a date and time". */
  placeholder?: string
  /** Minute increment for the time selects (1, 5, 15, 30, or 60). Default 15. */
  timeStep?: number
}

/** Date-time picker with built-in field error text and invalid styling. */
export function FormDateTimePickerField(props: Props) {
  return <FormPickerField field={props} picker={DateTimePickerButton} />
}
