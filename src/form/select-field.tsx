"use client"

import type { ReactNode } from "react"

import { Select, SelectContent, SelectTrigger, SelectValue } from "../select.js"

import type {
  FormFieldBaseProps,
  FormFieldMetaProps,
  FormFieldNameProps,
} from "./field-error.js"
import { fieldAria, FormFieldShell, useFormField } from "./field-shell.js"

type Props = FormFieldBaseProps &
  FormFieldMetaProps &
  FormFieldNameProps & {
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
  fieldName,
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
  const { id, errorText } = useFormField(meta, { submitted, showError })

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
          data-field-name={fieldName}
          className={className}
          {...fieldAria(id, errorText, { required })}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>{children}</SelectContent>
      </Select>
    </FormFieldShell>
  )
}
