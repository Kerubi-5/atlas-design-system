"use client"

import { type ReactNode, useId } from "react"

import { Select, SelectContent, SelectTrigger, SelectValue } from "../select.js"

import type { FormFieldBaseProps, FormFieldMetaProps } from "./field-error.js"
import {
  describedBy,
  FormFieldShell,
  invalidWhen,
  metaErrorText,
} from "./field-shell.js"

type Props = FormFieldBaseProps &
  FormFieldMetaProps & {
    /** The selected item's value, or `undefined` for none. */
    value: string | undefined
    /** Called with the value of the item the person picks. */
    onValueChange: (value: string) => void
    /** Trigger text while no item is selected. */
    placeholder?: string
    /** Requires a value (native form validation) and marks the label. */
    required?: boolean
    /** Forwarded to the select trigger. */
    className?: string
    /** Forwarded to the select's option list (`SelectContent`). */
    contentClassName?: string
    /** The `SelectItem`s (and groups) to choose from. */
    children: ReactNode
  }

/** Select control with built-in field error text and invalid styling. */
export function FormSelectField({
  value,
  meta,
  submitted,
  showError,
  label,
  onValueChange,
  placeholder,
  required,
  className,
  fieldClassName,
  contentClassName,
  children,
}: Props) {
  const errorText = metaErrorText(meta, { submitted, showError })
  const id = useId()

  return (
    <FormFieldShell
      id={id}
      label={label}
      errorText={errorText}
      required={required}
      className={fieldClassName}
    >
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger
          id={id}
          className={className}
          aria-required={required || undefined}
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
