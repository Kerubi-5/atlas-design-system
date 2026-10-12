"use client"

import { useId } from "react"

import { DatePickerButton, type DateLike } from "../date-picker.js"

import type { FieldMetaState } from "./field-error.js"
import { FormFieldShell, invalidWhen, metaErrorText } from "./field-shell.js"

type Props = {
  value: DateLike
  onValueChange: (date: Date | undefined) => void
  label: string
  meta?: FieldMetaState
  placeholder?: string
  disabled?: boolean
  /** Forwarded to the date picker trigger. */
  className?: string
}

/** Date picker with built-in field error text and invalid styling. */
export function FormDatePickerField({
  value,
  onValueChange,
  label,
  meta,
  placeholder,
  disabled,
  className,
}: Props) {
  const errorText = metaErrorText(meta)
  const id = useId()

  return (
    <FormFieldShell id={id} label={label} errorText={errorText}>
      <DatePickerButton
        id={id}
        value={value}
        onChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        aria-invalid={invalidWhen(errorText)}
      />
    </FormFieldShell>
  )
}
