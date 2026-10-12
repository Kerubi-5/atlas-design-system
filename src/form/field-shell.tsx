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

/** Id of the label `FormFieldShell` renders for control `id`. */
export function labelIdFor(id: string) {
  return `${id}-label`
}

/** Id of the error text `FormFieldShell` renders for control `id`. */
export function errorIdFor(id: string) {
  return `${id}-error`
}

/**
 * `aria-describedby` for the control: the given hint ids, plus the error
 * text while there is one, or `undefined` when there is nothing to read.
 */
export function describedBy(
  id: string,
  errorText: string | undefined,
  ...hintIds: Array<string | undefined>
) {
  const ids = [...hintIds, errorText ? errorIdFor(id) : undefined].filter(
    Boolean
  )
  return ids.length ? ids.join(" ") : undefined
}

/**
 * Label, control, and error text stacked with the kit's field spacing.
 * `labelAction` sits on the label's row (the Markdown field's mode toggle).
 * Set `labelFor` to false when the control is not rendered (Markdown
 * preview), so the label does not point at a missing element.
 */
export function FormFieldShell({
  id,
  label,
  labelAction,
  errorText,
  labelFor = true,
  children,
}: {
  id: string
  label: string
  labelAction?: ReactNode
  errorText: string | undefined
  labelFor?: boolean
  children: ReactNode
}) {
  const labelNode = (
    <Label id={labelIdFor(id)} htmlFor={labelFor ? id : undefined}>
      {label}
    </Label>
  )
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
      <FieldError id={errorIdFor(id)} text={errorText} />
    </div>
  )
}
