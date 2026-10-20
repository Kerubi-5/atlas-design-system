"use client"

import { type ComponentProps, useId } from "react"

import { Combobox } from "../combobox.js"

import type {
  FormFieldBaseProps,
  FormFieldDescriptionProps,
  FormFieldMetaProps,
} from "./field-error.js"
import { fieldAria, FormFieldShell, metaErrorText } from "./field-shell.js"

type Props = FormFieldBaseProps &
  FormFieldMetaProps &
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
  label,
  description,
  meta,
  submitted,
  showError,
  required,
  fieldClassName,
  ...props
}: Props) {
  const id = useId()
  const errorText = metaErrorText(meta, { submitted, showError })

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
        {...fieldAria(id, errorText, { description, required })}
      />
    </FormFieldShell>
  )
}
