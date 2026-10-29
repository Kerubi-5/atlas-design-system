"use client"

import {
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  useId,
} from "react"
import { Slot } from "radix-ui"

import type { DateLike, DatePickerCalendarProps } from "../date-picker.js"
import type { AsChildProps } from "../internal/as-child.js"
import { fieldNameProps, pickerValueId } from "../internal/form-control.js"
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
function metaErrorText(
  meta: FieldMetaState | undefined,
  { submitted, showError = true }: ErrorTimingProps = {}
) {
  if (!meta || !showError) return undefined
  if (meta.isTouched === false && !submitted) return undefined
  return getFieldErrorMessage(meta.errors[0])
}

/**
 * The error text a `form/*` field shows (`metaErrorText`) and its control
 * id. The id is generated per field, so two forms that share a field name
 * (login and sign-up `email`) never share an id, and each label, hint, and
 * error links to its own control.
 */
export function useFormField(
  meta: FieldMetaState | undefined,
  timing: ErrorTimingProps
) {
  return { id: useId(), errorText: metaErrorText(meta, timing) }
}

/** Id of the label `FormFieldShell` renders for control `id`. */
function labelIdFor(id: string) {
  return `${id}-label`
}

/** Id of the hint `FormFieldShell` renders for control `id`. */
function descriptionIdFor(id: string) {
  return `${id}-description`
}

/** Id of the error text `FormFieldShell` renders for control `id`. */
function errorIdFor(id: string) {
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

/** The props a date or date-time field keeps for its shell, not the picker. */
type PickerFieldOwnKey =
  | "fieldName"
  | "label"
  | "meta"
  | "submitted"
  | "showError"
  | "required"
  | "fieldClassName"

/**
 * The date and date-time fields: `picker` (the trigger) in a
 * `FormFieldShell`, given every prop of `field` the shell does not take. A
 * button cannot carry `required`, so the trigger is described by the hidden
 * "Required" text and reads "label, value".
 */
export function FormPickerField<P extends PickerFieldBaseProps>({
  field,
  picker: Picker,
}: {
  /** The field's props. */
  field: P
  /** The picker trigger. */
  picker: ComponentType<
    Omit<P, PickerFieldOwnKey> & {
      id: string
      "data-field-name"?: string
    } & ReturnType<typeof fieldAria>
  >
}) {
  const {
    fieldName,
    label,
    meta,
    submitted,
    showError,
    required,
    fieldClassName,
    ...pickerProps
  } = field
  const { id, errorText } = useFormField(meta, { submitted, showError })

  return (
    <FormFieldShell
      id={id}
      label={label}
      errorText={errorText}
      required={required}
      className={fieldClassName}
    >
      <Picker
        {...pickerProps}
        id={id}
        {...fieldNameProps(fieldName)}
        {...fieldAria(id, errorText, {
          required: required && "described",
          labelledBy: "label-value",
        })}
      />
    </FormFieldShell>
  )
}

/**
 * Every `form/*` field's wrapper (`data-slot="form-field"`): children with
 * the field spacing, then the error text. `asChild` makes the one child the
 * wrapper (the checkbox group's fieldset).
 */
export function FormFieldFrame({
  id,
  errorText,
  asChild,
  className,
  children,
  ...props
}: Omit<ComponentProps<"div">, "id"> &
  AsChildProps & {
    /** Id of the control; the error id derives from it. */
    id: string
    /** Error text under the children; `undefined` shows none. */
    errorText: string | undefined
  }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="form-field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      <FieldError id={errorIdFor(id)} text={errorText} />
    </Comp>
  )
}

/** A field's hint, with id `descriptionIdFor(id)`. */
export function FormFieldDescription({
  id,
  children,
}: {
  id: string
  children: ReactNode
}) {
  return (
    <p
      id={descriptionIdFor(id)}
      data-slot="form-field-description"
      className="text-xs text-muted-foreground"
    >
      {children}
    </p>
  )
}

/**
 * Label, control, hint, and error in a `FormFieldFrame`. `labelAction` sits
 * on the label's row; `labelFor={false}` when the control is not rendered
 * (Markdown preview). `required` marks the label only.
 */
export function FormFieldShell({
  id,
  label,
  labelAction,
  description,
  errorText,
  labelFor = true,
  required,
  children,
  ...props
}: Omit<ComponentProps<"div">, "id" | "children"> & {
  /** Id of the control; the label, hint, and error ids derive from it. */
  id: string
  /** Visible label text. */
  label: string
  /** Content on the label's row, after the label (e.g. a mode toggle). */
  labelAction?: ReactNode
  /** Hint under the control, with id `descriptionIdFor(id)`. */
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
    <FormFieldFrame {...props} id={id} errorText={errorText}>
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
      {children}
      {description ? (
        <FormFieldDescription id={id}>{description}</FormFieldDescription>
      ) : null}
      {required ? (
        <span id={requiredIdFor(id)} hidden>
          Required
        </span>
      ) : null}
    </FormFieldFrame>
  )
}
