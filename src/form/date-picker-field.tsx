"use client"

import { useId } from "react"

import { DatePickerButton, type DateLike } from "../date-picker.js"
import { Label } from "../label.js"

import {
  FieldError,
  getFieldErrorMessage,
  type FieldMetaState,
} from "./field-error.js"

type Props = {
  value: DateLike
  onValueChange: (date: Date | undefined) => void
  label: string
  meta?: FieldMetaState
  placeholder?: string
  disabled?: boolean
}

/** Date picker with built-in field error text and invalid styling. */
export function FormDatePickerField({
  value,
  onValueChange,
  label,
  meta,
  placeholder,
  disabled,
}: Props) {
  const errorText = meta ? getFieldErrorMessage(meta.errors[0]) : undefined
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <DatePickerButton
        id={id}
        value={value}
        onChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={errorText ? true : undefined}
      />
      <FieldError text={errorText} />
    </div>
  )
}
