"use client"

import { type ComponentProps, type ReactNode, useId } from "react"

import type {
  FormFieldBaseProps,
  FormFieldDescriptionProps,
  FormFieldMetaProps,
} from "./field-error.js"
import {
  describedBy,
  descriptionIdFor,
  FormFieldShell,
  invalidWhen,
  metaErrorText,
} from "./field-shell.js"

/** Props `FormControlField` hands its control: spread them onto it. */
export type FormControlProps = {
  /** Id the label points at. */
  id: string
  /** `true` while the field shows error text. */
  "aria-invalid": true | undefined
  /** Ids of the hint and the error text, when shown. */
  "aria-describedby": string | undefined
  /** `true` when the field is `required`. */
  "aria-required": true | undefined
}

type Props = Omit<FormFieldBaseProps, "fieldClassName"> &
  FormFieldMetaProps &
  FormFieldDescriptionProps &
  Omit<ComponentProps<"div">, "id" | "children"> & {
    /** Control id the label points at. Defaults to a generated id. */
    id?: string
    /** Marks the label and passes `aria-required` to the control. */
    required?: boolean
    /** Renders the control from the id and ARIA props it should carry. */
    children: (control: FormControlProps) => ReactNode
  }

/**
 * The `form/*` field layout for a control the kit does not ship (a
 * combobox, a segmented picker): label with the required marker, optional
 * hint, the control, and its error, with the same spacing, ids, and error
 * timing as `FormTextField`. `className` and other div props go to the
 * wrapper (`data-slot="form-field"`).
 */
export function FormControlField({
  id: idProp,
  label,
  description,
  required,
  meta,
  submitted,
  showError,
  children,
  ...props
}: Props) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorText = metaErrorText(meta, { submitted, showError })

  return (
    <FormFieldShell
      {...props}
      id={id}
      label={label}
      description={description}
      errorText={errorText}
      required={required}
    >
      {children({
        id,
        "aria-invalid": invalidWhen(errorText),
        "aria-describedby": describedBy(
          id,
          errorText,
          description ? descriptionIdFor(id) : undefined
        ),
        "aria-required": required || undefined,
      })}
    </FormFieldShell>
  )
}
