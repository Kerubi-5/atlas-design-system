"use client"

import { DatePickerButton, type DateLike } from "../date-picker.js"

import { FormPickerField, type PickerFieldBaseProps } from "./field-shell.js"

type Props = PickerFieldBaseProps & {
  /** The picked day, as a `Date` or `yyyy-MM-dd`; empty when unset. */
  value: DateLike
  /** Called with the picked day, or `undefined` when cleared. */
  onValueChange: (date: Date | undefined) => void
  /** Trigger text while no day is picked. Default "Pick a date". */
  placeholder?: string
  /**
   * Shows a Clear row in the popover, which calls `onValueChange` with
   * `undefined`. Default `false`.
   */
  clearable?: boolean
}

/** Date picker with built-in field error text and invalid styling. */
export function FormDatePickerField(props: Props) {
  return <FormPickerField field={props} picker={DatePickerButton} />
}
