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
  /** Forwarded to the select trigger. */
  className?: string
  /** Classes for the field wrapper (label, trigger, and error). */
  fieldClassName?: string
  /** Forwarded to the select's option list (`SelectContent`). */
  contentClassName?: string
  children: ReactNode
}

/** Select control with built-in field error text and invalid styling. */
export function FormSelectField({
  value,
  meta,
  label,
  onValueChange,
  placeholder,
  className,
  fieldClassName,
  contentClassName,
  children,
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
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={className}
          aria-invalid={invalidWhen(errorText)}
          aria-describedby={describedBy(id, errorText)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>{children}</SelectContent>
      </Select>
    </FormFieldShell>
  )
}
