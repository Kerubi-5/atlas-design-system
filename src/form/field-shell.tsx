import type { ReactNode } from "react"

import { Label } from "../label.js"

import {
  FieldError,
  getFieldErrorMessage,
  type FieldMetaState,
} from "./field-error.js"

/**
 * Not a public entry. The layout and error wiring every `form/*` field
 * shares, so a field only says which control it renders.
 */

/** First error in `meta`, or `undefined` when there is no meta or no error. */
export function metaErrorText(meta: FieldMetaState | undefined) {
  return meta ? getFieldErrorMessage(meta.errors[0]) : undefined
}

/** `aria-invalid` for the control: `true` while there is error text. */
export function invalidWhen(errorText: string | undefined) {
  return errorText ? true : undefined
}

/**
 * Label, control, and error text stacked with the kit's field spacing.
 * `labelAction` sits on the label's row (the Markdown field's mode toggle).
 */
export function FormFieldShell({
  id,
  label,
  labelAction,
  errorText,
  children,
}: {
  id: string
  label: string
  labelAction?: ReactNode
  errorText: string | undefined
  children: ReactNode
}) {
  const labelNode = <Label htmlFor={id}>{label}</Label>
  return (
    <div className="flex flex-col gap-1.5">
      {labelAction ? (
        <div className="flex items-center justify-between gap-2">
          {labelNode}
          {labelAction}
        </div>
      ) : (
        labelNode
      )}
      {children}
      <FieldError text={errorText} />
    </div>
  )
}
