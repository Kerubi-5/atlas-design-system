"use client"

import { type ReactNode, useId } from "react"

import { Select, SelectContent, SelectTrigger, SelectValue } from "../select.js"

import type { FieldMetaState } from "./field-error.js"
import {
  describedBy,
  FormFieldShell,
  invalidWhen,
  metaErrorText,
} from "./field-shell.js"

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
  const errorText = metaErrorText(meta)
  const id = useId()

  return (
    <FormFieldShell id={id} label={label} errorText={errorText}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          aria-invalid={invalidWhen(errorText)}
          aria-describedby={describedBy(id, errorText)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormFieldShell>
  )
}
