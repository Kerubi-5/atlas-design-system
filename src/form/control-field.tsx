"use client"

import { type ComponentProps, type ReactNode, useId } from "react"

import type { ErrorTimingProps, FieldMetaState } from "./field-error.js"
import {
  describedBy,
  descriptionIdFor,
  FormFieldShell,
  invalidWhen,
  metaErrorText,
} from "./field-shell.js"

/** Props `FormControlField` hands its control: spread them onto it. */
export type FormControlProps = {
  id: string
  "aria-invalid": true | undefined
  "aria-describedby": string | undefined
  "aria-required": true | undefined
}

type Props = ErrorTimingProps &
  Omit<ComponentProps<"div">, "id" | "children"> & {
    /** Control id the label points at. Defaults to a generated id. */
    id?: string
    label: string
    /** Hint between the label and the control, read with the control. */
    description?: ReactNode
    /** Marks the label and passes `aria-required` to the control. */
    required?: boolean
    /** Error meta, the same shape the other `form/*` fields take. */
    meta?: FieldMetaState
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
