"use client"

import { useId } from "react"

import { DateTimePickerButton } from "../date-time-picker.js"

import type { FieldMetaState } from "./field-error.js"
import {
  describedBy,
  FormFieldShell,
  invalidWhen,
  labelIdFor,
  metaErrorText,
} from "./field-shell.js"

type Props = {
  value: Date | null
  onValueChange: (date: Date | null) => void
  label: string
  meta?: FieldMetaState
  placeholder?: string
  disabled?: boolean
  /** Minute increment forwarded to the picker. */
  timeStep?: number
  /** Forwarded to the date-time picker trigger. */
  className?: string
}

/** Date-time picker with built-in field error text and invalid styling. */
export function FormDateTimePickerField({
  value,
  onValueChange,
  label,
  meta,
  placeholder,
  disabled,
  timeStep,
  className,
}: Props) {
  const errorText = metaErrorText(meta)
  const id = useId()

  return (
    <FormFieldShell id={id} label={label} errorText={errorText}>
      <DateTimePickerButton
        id={id}
        value={value}
        onChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        timeStep={timeStep}
        className={className}
        aria-invalid={invalidWhen(errorText)}
        // A <label for> alone would hide the picked value from the name, so
        // name the trigger "label, value" explicitly.
        aria-labelledby={`${labelIdFor(id)} ${id}-value`}
        aria-describedby={describedBy(id, errorText)}
      />
    </FormFieldShell>
  )
}
