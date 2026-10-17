"use client"

import { type ComponentProps, type ReactNode, useId } from "react"

import { Combobox } from "../combobox.js"

import type { ErrorTimingProps, FieldMetaState } from "./field-error.js"
import {
  describedBy,
  descriptionIdFor,
  FormFieldShell,
  invalidWhen,
  metaErrorText,
} from "./field-shell.js"

type Props = ErrorTimingProps &
  Omit<
    ComponentProps<typeof Combobox>,
    "id" | "aria-invalid" | "aria-describedby" | "aria-required"
  > & {
    label: string
    description?: ReactNode
    meta?: FieldMetaState
    /** Marks the label and passes `aria-required` to the trigger. */
    required?: boolean
    /** Classes for the field wrapper; `className` styles the trigger. */
    fieldClassName?: string
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
        aria-required={required || undefined}
        aria-invalid={invalidWhen(errorText)}
        aria-describedby={describedBy(
          id,
          errorText,
          description ? descriptionIdFor(id) : undefined
        )}
      />
    </FormFieldShell>
  )
}
