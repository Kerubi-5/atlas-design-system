"use client"

import { useId } from "react"

import { DatePickerButton, type DateLike } from "../date-picker.js"

import {
  FormFieldShell,
  metaErrorText,
  pickerFieldAria,
  type PickerFieldBaseProps,
} from "./field-shell.js"

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
export function FormDatePickerField({
  id: idProp,
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
  const generatedId = useId()
  const id = idProp ?? generatedId

  return (
    <FormFieldShell
      id={id}
      label={label}
      errorText={errorText}
      required={required}
      className={fieldClassName}
    >
      <DatePickerButton
        {...picker}
        id={id}
        onValueChange={onValueChange}
        {...pickerFieldAria(id, errorText, required)}
      />
    </FormFieldShell>
  )
}
