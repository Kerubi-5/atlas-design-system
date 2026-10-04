"use client"

import { type ReactNode, useId } from "react"

import { Label } from "../label.js"
import { Select, SelectContent, SelectTrigger, SelectValue } from "../select.js"

import {
  FieldError,
  getFieldErrorMessage,
  type FieldMetaState,
} from "./field-error.js"

type Props = {
  value: string | undefined
  meta?: FieldMetaState
  label: string
  onValueChange: (value: string) => void
  placeholder?: string
  children: ReactNode
}

/** Select control with built-in field error text and invalid styling. */
export function FormSelectField({
  value,
  meta,
  label,
  onValueChange,
  placeholder,
  children,
}: Props) {
  const errorText = meta ? getFieldErrorMessage(meta.errors[0]) : undefined
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} aria-invalid={errorText ? true : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      <FieldError text={errorText} />
    </div>
  )
}
