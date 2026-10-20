import type { ComponentProps, ReactNode } from "react"

import type { DateLike, DatePickerCalendarProps } from "../date-picker.js"
import { pickerValueId } from "../internal/form-control.js"
import { Label } from "../label.js"
import { cn } from "../utils.js"

import {
  type ErrorTimingProps,
  FieldError,
  getFieldErrorMessage,
  type FieldMetaState,
  type FormFieldBaseProps,
  type FormFieldMetaProps,
} from "./field-error.js"

/**
 * Not a public entry. The layout and error wiring every `form/*` field
 * shares, so a field only says which control it renders. Custom controls
 * get the same shell through the public `FormControlField`.
 */

/**
 * First error in `meta`, or `undefined` when there is no meta, no error,
 * `showError` is false, or the field is untouched (`isTouched: false`)
 * and the form has not been submitted.
 */
export function metaErrorText(
  meta: FieldMetaState | undefined,
  { submitted, showError = true }: ErrorTimingProps = {}
) {
  if (!meta || !showError) return undefined
  if (meta.isTouched === false && !submitted) return undefined
  return getFieldErrorMessage(meta.errors[0])
}

/** Id of the label `FormFieldShell` renders for control `id`. */
function labelIdFor(id: string) {
  return `${id}-label`
}

/** Id of the hint `FormFieldShell` renders for control `id`. */
export function descriptionIdFor(id: string) {
  return `${id}-description`
}

/** Id of the error text `FormFieldShell` renders for control `id`. */
export function errorIdFor(id: string) {
  return `${id}-error`
}

/**
 * Id of the hidden "Required" text `FormFieldShell` renders for a required
 * control `id`, for controls that cannot carry `required` themselves.
 */
function requiredIdFor(id: string) {
  return `${id}-required`
}

/**
 * ARIA for a field's control, from the ids `FormFieldShell` renders:
 * invalid while there is error text, described by the hint, the hidden
 * "Required" text, and the error. `required: "described"` is for a button
 * trigger, which cannot take `aria-required`; leave `required` out where
 * the control carries native `required`. `labelledBy: "label"` names a
 * group; `"label-value"` reads a picker "label, value".
 */
export function fieldAria(
  id: string,
  errorText: string | undefined,
  {
    description,
    required,
    labelledBy,
  }: {
    /** The field's hint; when set, the control is described by it. */
    description?: ReactNode
    required?: boolean | "described"
    labelledBy?: "label" | "label-value"
  } = {}
) {
  const describedBy = [
    description ? descriptionIdFor(id) : undefined,
    required === "described" ? requiredIdFor(id) : undefined,
    errorText ? errorIdFor(id) : undefined,
  ].filter(Boolean)
  return {
    "aria-invalid": errorText ? (true as const) : undefined,
    "aria-describedby": describedBy.length ? describedBy.join(" ") : undefined,
    "aria-required": required === true ? (true as const) : undefined,
    ...(labelledBy && {
      "aria-labelledby":
        labelledBy === "label"
          ? labelIdFor(id)
          : `${labelIdFor(id)} ${pickerValueId(id)}`,
    }),
  }
}

/**
 * Props the date and date-time fields share; each adds its own `value`,
 * `onValueChange`, and `placeholder`.
 */
export type PickerFieldBaseProps = FormFieldBaseProps &
  FormFieldMetaProps & {
    /**
     * Id of the trigger the label points at. Defaults to a generated id;
     * pass the field name (`id={field.name}`) so a submit handler such as
     * `focusFirstInvalid` can find the control.
     */
    id?: string
    /** Disables the trigger so no date can be picked. */
    disabled?: boolean
    /** Marks the label and adds "Required" to the trigger's description. */
    required?: boolean
    /** Earliest day that can be picked; earlier days are disabled. */
    minDate?: DateLike
    /** Latest day that can be picked; later days are disabled. */
    maxDate?: DateLike
    /** Forwarded to the picker trigger. */
    className?: string
    /** Forwarded to the picker popover. */
    contentClassName?: string
    /** Day Picker options forwarded to the calendar (disabled days, etc.). */
    calendarProps?: DatePickerCalendarProps
  }

/**
 * Label, control, and error text stacked with the kit's field spacing.
 * `labelAction` sits on the label's row (the Markdown field's mode toggle).
 * Set `labelFor` to false when the control is not rendered (Markdown
 * preview), so the label does not point at a missing element.
 * `description` is a hint between the label and the control, with id
 * `descriptionIdFor(id)`. `className` and other div props go to the
 * wrapper (`data-slot="form-field"`), e.g. a width.
 * `required` marks the label; the control still sets its own `required`.
 * The error sits below the control and takes no space while there is none,
 * so put fields in a grid row with `items-start` to keep controls aligned.
 */
export function FormFieldShell({
  id,
  label,
  labelAction,
  description,
  errorText,
  labelFor = true,
  required,
  className,
  children,
  ...props
}: Omit<ComponentProps<"div">, "id" | "children"> & {
  /** Id of the control; the label, hint, and error ids derive from it. */
  id: string
  /** Visible label text. */
  label: string
  /** Content on the label's row, after the label (e.g. a mode toggle). */
  labelAction?: ReactNode
  /** Hint between the label and the control, with id `descriptionIdFor(id)`. */
  description?: ReactNode
  /** Error text under the control; `undefined` shows none. */
  errorText: string | undefined
  /** When false, the label does not point at the control. Default true. */
  labelFor?: boolean
  /** Marks the label and renders the hidden "Required" text. */
  required?: boolean
  children: ReactNode
}) {
  const labelNode = (
    <Label
      id={labelIdFor(id)}
      htmlFor={labelFor ? id : undefined}
      required={required}
    >
      {label}
    </Label>
  )
  return (
    <div
      data-slot="form-field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      {labelAction ? (
        <div
          data-slot="form-field-header"
          className="flex items-center justify-between gap-2"
        >
          {labelNode}
          {labelAction}
        </div>
      ) : (
        labelNode
      )}
      {description ? (
        <p
          id={descriptionIdFor(id)}
          data-slot="form-field-description"
          className="text-xs text-muted-foreground"
        >
          {description}
        </p>
      ) : null}
      {children}
      {required ? (
        <span id={requiredIdFor(id)} hidden>
          Required
        </span>
      ) : null}
      <FieldError id={errorIdFor(id)} text={errorText} />
    </div>
  )
}
