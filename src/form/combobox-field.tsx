"use client"

import type { ComponentProps } from "react"

import { Combobox } from "../combobox.js"

import type {
  FormFieldBaseProps,
  FormFieldDescriptionProps,
  FormFieldMetaProps,
  FormFieldNameProps,
} from "./field-error.js"
import { fieldAria, FormFieldShell, useFormField } from "./field-shell.js"

type Props = FormFieldBaseProps &
  FormFieldMetaProps &
  FormFieldNameProps &
  FormFieldDescriptionProps &
  Omit<
    ComponentProps<typeof Combobox>,
    "id" | "aria-invalid" | "aria-describedby" | "aria-required"
  > & {
    /** Marks the label and passes `aria-required` to the trigger. */
    required?: boolean
  }

/**
 * `Combobox` with a label, optional hint, and the `form/*` error text and
 * timing. Pass the field's blur handler as `onBlur` so touch state updates.
 */
export function FormComboboxField({
  fieldName,
  label,
  description,
  meta,
  submitted,
  showError,
  required,
  fieldClassName,
  ...props
}: Props) {
  const { id, errorText } = useFormField(meta, { submitted, showError })

  return (
    <FormFieldShell
      id={id}
      label={label}
      description={description}
      errorText={errorText}
      required={required}
      className={fieldClassName}
    >
      <Combobox
        {...props}
        id={id}
        data-field-name={fieldName}
        {...fieldAria(id, errorText, { description, required })}
      />
    </FormFieldShell>
  )
}
