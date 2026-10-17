"use client"

import { useId } from "react"

import { DateTimePickerButton } from "../date-time-picker.js"

import {
  FormFieldShell,
  metaErrorText,
  pickerFieldAria,
  type PickerFieldBaseProps,
} from "./field-shell.js"

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
export function FormDateTimePickerField({
  onValueChange,
  label,
  meta,
  submitted,
  showError,
  required,
  fieldClassName,
  ...picker
}: Props) {
  const errorText = metaErrorText(meta, { submitted, showError })
  const id = useId()

  return (
    <FormFieldShell
      id={id}
      label={label}
      errorText={errorText}
      required={required}
      className={fieldClassName}
    >
      <DateTimePickerButton
        {...picker}
        id={id}
        onValueChange={onValueChange}
        {...pickerFieldAria(id, errorText, required)}
      />
    </FormFieldShell>
  )
}
