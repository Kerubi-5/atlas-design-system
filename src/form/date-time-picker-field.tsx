"use client"

import { useId } from "react"

import { DateTimePickerButton } from "../date-time-picker.js"
import { Label } from "../label.js"

import {
  FieldError,
  getFieldErrorMessage,
  type FieldMetaState,
} from "./field-error.js"

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
  const errorText = meta ? getFieldErrorMessage(meta.errors[0]) : undefined
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <DateTimePickerButton
        id={id}
        value={value}
        onChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        timeStep={timeStep}
        className={className}
        aria-invalid={errorText ? true : undefined}
      />
      <FieldError text={errorText} />
    </div>
  )
}
