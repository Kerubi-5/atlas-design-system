"use client"

import type { ReactNode } from "react"

import { fieldNameProps } from "../internal/form-control.js"
import { ToggleGroup, ToggleGroupItem } from "../toggle-group.js"

import type {
  FormFieldBaseProps,
  FormFieldDescriptionProps,
  FormFieldMetaProps,
} from "./field-error.js"
import { fieldAria, FormFieldShell, useFormField } from "./field-shell.js"

export type ToggleGroupFieldOption<T extends string> = {
  /** Value passed to `onValueChange` when this item is pressed. */
  value: T
  /** Content of the toggle item. */
  label: ReactNode
}

type Props<T extends string> = FormFieldBaseProps &
  FormFieldMetaProps &
  FormFieldDescriptionProps & {
    /** The selected option, or `""` for none yet. */
    value: T | ""
    /** Called with an option's value; pressing the active item keeps it. */
    onValueChange: (value: T) => void
    /** The items to choose from, in order. */
    options: ToggleGroupFieldOption<T>[]
    /** Marks the label. */
    required?: boolean
    /** Disables every item in the group. */
    disabled?: boolean
    /** Size of the toggle items. Default "sm". */
    size?: "default" | "sm" | "lg"
    /** Forwarded to the toggle group. */
    className?: string
  }

/**
 * One choice from a few as a joined outline toggle group (a segmented
 * control), with a visible label and the `form/*` error wiring.
 */
export function FormToggleGroupField<T extends string>({
  fieldName,
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
  const { id, errorText } = useFormField(meta, { submitted, showError })

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
        {...fieldNameProps(fieldName)}
        type="single"
        value={value}
        onValueChange={handleValueChange}
        variant="outline"
        size={size}
        spacing={0}
        disabled={disabled}
        {...fieldAria(id, errorText, { description, labelledBy: "label" })}
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
