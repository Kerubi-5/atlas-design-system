"use client"

import { type ReactNode, useId } from "react"

import { ToggleGroup, ToggleGroupItem } from "../toggle-group.js"

import type { ErrorTimingProps, FieldMetaState } from "./field-error.js"
import {
  describedBy,
  descriptionIdFor,
  FormFieldShell,
  invalidWhen,
  labelIdFor,
  metaErrorText,
} from "./field-shell.js"

export type ToggleGroupFieldOption<T extends string> = {
  value: T
  label: ReactNode
}

type Props<T extends string> = ErrorTimingProps & {
  label: string
  description?: ReactNode
  /** The selected option, or `""` for none yet. */
  value: T | ""
  /** Called with an option's value; pressing the active item keeps it. */
  onValueChange: (value: T) => void
  options: ToggleGroupFieldOption<T>[]
  meta?: FieldMetaState
  required?: boolean
  disabled?: boolean
  size?: "default" | "sm" | "lg"
  /** Forwarded to the toggle group. */
  className?: string
  /** Classes for the field wrapper. */
  fieldClassName?: string
}

/**
 * One choice from a few as a joined outline toggle group (a segmented
 * control), with a visible label and the `form/*` error wiring.
 */
export function FormToggleGroupField<T extends string>({
  label,
  description,
  value,
  onValueChange,
  options,
  meta,
  submitted,
  showError,
  required,
  disabled,
  size = "sm",
  className,
  fieldClassName,
}: Props<T>) {
  const id = useId()
  const errorText = metaErrorText(meta, { submitted, showError })

  function handleValueChange(next: string) {
    const option = options.find((o) => o.value === next)
    if (option) onValueChange(option.value)
  }

  return (
    <FormFieldShell
      id={id}
      label={label}
      labelFor={false}
      description={description}
      errorText={errorText}
      required={required}
      className={fieldClassName}
    >
      <ToggleGroup
        id={id}
        type="single"
        value={value}
        onValueChange={handleValueChange}
        variant="outline"
        size={size}
        spacing={0}
        disabled={disabled}
        aria-labelledby={labelIdFor(id)}
        aria-invalid={invalidWhen(errorText)}
        aria-describedby={describedBy(
          id,
          errorText,
          description ? descriptionIdFor(id) : undefined
        )}
        className={className}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FormFieldShell>
  )
}
