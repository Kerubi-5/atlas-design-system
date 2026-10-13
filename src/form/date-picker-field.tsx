"use client"

import { useId } from "react"

import {
  DatePickerButton,
  type DateLike,
  type DatePickerCalendarProps,
} from "../date-picker.js"

import type { FieldMetaState } from "./field-error.js"
import {
  FormFieldShell,
  metaErrorText,
  pickerFieldAria,
} from "./field-shell.js"

type Props = {
  value: DateLike
  onValueChange: (date: Date | undefined) => void
  label: string
  meta?: FieldMetaState
  placeholder?: string
  disabled?: boolean
  /** Forwarded to the date picker trigger. */
  className?: string
  /** Classes for the field wrapper (label, trigger, and error). */
  fieldClassName?: string
  /** Forwarded to the date picker popover. */
  contentClassName?: string
  /** Day Picker options forwarded to the calendar (disabled days, etc.). */
  calendarProps?: DatePickerCalendarProps
}

/** Date picker with built-in field error text and invalid styling. */
export function FormDatePickerField({
  onValueChange,
  label,
  meta,
  fieldClassName,
  ...picker
}: Props) {
  const errorText = metaErrorText(meta)
  const id = useId()

  return (
    <FormFieldShell
      id={id}
      label={label}
      errorText={errorText}
      className={fieldClassName}
    >
      <DatePickerButton
        {...picker}
        id={id}
        onChange={onValueChange}
        {...pickerFieldAria(id, errorText)}
      />
    </FormFieldShell>
  )
}
