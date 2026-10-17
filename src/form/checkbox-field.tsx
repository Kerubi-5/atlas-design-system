"use client"

import { type ReactNode, useId } from "react"

import { Checkbox } from "../checkbox.js"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../field.js"
import { cn } from "../utils.js"

import {
  type ErrorTimingProps,
  FieldError,
  type FieldMetaState,
} from "./field-error.js"
import {
  describedBy,
  descriptionIdFor,
  errorIdFor,
  invalidWhen,
  metaErrorText,
} from "./field-shell.js"

type CheckboxFieldProps = ErrorTimingProps & {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onBlur?: () => void
  label: string
  /** Hint under the label, read with the checkbox. */
  description?: ReactNode
  id?: string
  meta?: FieldMetaState
  required?: boolean
  disabled?: boolean
  /** Checkbox before the label (default) or after the label and hint. */
  controlPosition?: "start" | "end"
  /** Forwarded to the checkbox. */
  className?: string
  /** Classes for the field wrapper. */
  fieldClassName?: string
}

/**
 * One boolean as a labelled checkbox, with an optional hint and the same
 * error text and timing as the other `form/*` fields.
 */
export function FormCheckboxField({
  checked,
  onCheckedChange,
  onBlur,
  label,
  description,
  id: idProp,
  meta,
  submitted,
  showError,
  required,
  disabled,
  controlPosition = "start",
  className,
  fieldClassName,
}: CheckboxFieldProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorText = metaErrorText(meta, { submitted, showError })
  const descriptionId = description ? descriptionIdFor(id) : undefined

  const checkbox = (
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={(next) => onCheckedChange(next === true)}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      aria-required={required || undefined}
      aria-invalid={invalidWhen(errorText)}
      aria-describedby={describedBy(id, errorText, descriptionId)}
      className={className}
    />
  )
  const labelNode = (
    <FieldLabel htmlFor={id} required={required}>
      {label}
    </FieldLabel>
  )

  return (
    <div
      data-slot="form-field"
      className={cn("flex flex-col gap-1.5", fieldClassName)}
    >
      <Field orientation="horizontal">
        {controlPosition === "start" ? checkbox : null}
        {description ? (
          <FieldContent>
            {labelNode}
            <FieldDescription id={descriptionId}>
              {description}
            </FieldDescription>
          </FieldContent>
        ) : (
          labelNode
        )}
        {controlPosition === "end" ? checkbox : null}
      </Field>
      <FieldError id={errorIdFor(id)} text={errorText} />
    </div>
  )
}

export type CheckboxGroupOption<T extends string | number> = {
  value: T
  label: string
}

type CheckboxGroupFieldProps<T extends string | number> = ErrorTimingProps & {
  /** The group's legend. */
  label: string
  description?: ReactNode
  options: CheckboxGroupOption<T>[]
  value: T[]
  /** The checked values, in `options` order. */
  onValueChange: (value: T[]) => void
  meta?: FieldMetaState
  disabled?: boolean
  /** Layout of the options, e.g. a grid. Defaults to a wrapping row. */
  className?: string
  /** Classes for the fieldset. */
  fieldClassName?: string
}

/** Several values from a short list, as a labelled set of checkboxes. */
export function FormCheckboxGroupField<T extends string | number>({
  label,
  description,
  options,
  value,
  onValueChange,
  meta,
  submitted,
  showError,
  disabled,
  className,
  fieldClassName,
}: CheckboxGroupFieldProps<T>) {
  const id = useId()
  const errorText = metaErrorText(meta, { submitted, showError })
  const descriptionId = description ? descriptionIdFor(id) : undefined

  function toggle(option: T, on: boolean) {
    const next = new Set(value)
    if (on) next.add(option)
    else next.delete(option)
    onValueChange(options.map((o) => o.value).filter((v) => next.has(v)))
  }

  return (
    <FieldSet
      data-slot="form-field"
      aria-invalid={invalidWhen(errorText)}
      aria-describedby={describedBy(id, errorText, descriptionId)}
      className={cn("gap-1.5", fieldClassName)}
    >
      <FieldLegend variant="label" className="mb-0">
        {label}
      </FieldLegend>
      {description ? (
        <p
          id={descriptionId}
          data-slot="form-field-description"
          className="text-xs text-muted-foreground"
        >
          {description}
        </p>
      ) : null}
      <div
        data-slot="form-checkbox-group-options"
        className={cn("flex flex-wrap gap-x-6 gap-y-3 pt-1", className)}
      >
        {options.map((option) => {
          const optionId = `${id}-${option.value}`
          return (
            <Field key={option.value} orientation="horizontal">
              <Checkbox
                id={optionId}
                checked={value.includes(option.value)}
                onCheckedChange={(next) => toggle(option.value, next === true)}
                disabled={disabled}
              />
              <FieldLabel htmlFor={optionId}>{option.label}</FieldLabel>
            </Field>
          )
        })}
      </div>
      <FieldError id={errorIdFor(id)} text={errorText} />
    </FieldSet>
  )
}
