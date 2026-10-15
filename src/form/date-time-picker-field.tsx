"use client"

import { useId } from "react"

import type { DateLike, DatePickerCalendarProps } from "../date-picker.js"
import { DateTimePickerButton } from "../date-time-picker.js"

import type { FieldMetaState } from "./field-error.js"
import {
  FormFieldShell,
  metaErrorText,
  pickerFieldAria,
} from "./field-shell.js"

type Props = {
  value: Date | null
  onValueChange: (date: Date | null) => void
  label: string
  meta?: FieldMetaState
  placeholder?: string
  disabled?: boolean
  /** Marks the label and adds "Required" to the trigger's description. */
  required?: boolean
  /** Earliest day that can be picked; earlier days are disabled. */
  minDate?: DateLike
  /** Latest day that can be picked; later days are disabled. */
  maxDate?: DateLike
  /** Minute increment forwarded to the picker. */
  timeStep?: number
  /** Forwarded to the date-time picker trigger. */
  className?: string
  /** Classes for the field wrapper (label, trigger, and error). */
  fieldClassName?: string
  /** Forwarded to the date-time picker popover. */
  contentClassName?: string
  /** Day Picker options forwarded to the calendar (disabled days, etc.). */
  calendarProps?: DatePickerCalendarProps
}

/** Date-time picker with built-in field error text and invalid styling. */
export function FormDateTimePickerField({
  onValueChange,
  label,
  meta,
  required,
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
      required={required}
      className={fieldClassName}
    >
      <DateTimePickerButton
        {...picker}
        id={id}
        onChange={onValueChange}
        {...pickerFieldAria(id, errorText, required)}
      />
    </FormFieldShell>
  )
}
