"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { labelText } from "./internal/styles.js"
import { cn } from "./utils.js"

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  /**
   * Shows a visible required marker after the text. The marker is hidden
   * from assistive tech, so set `required` (or `aria-required`) on the
   * control too; screen readers announce it from there.
   */
  required?: boolean
  /** Classes for the required marker (`data-slot="label-required"`). */
  requiredClassName?: string
}

/**
 * Form label. `required` adds a visible marker; style it with
 * `requiredClassName` or the `label-required` slot.
 */
function Label({
  className,
  required,
  requiredClassName,
  children,
  ...props
}: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        labelText,
        "flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-data-[slot=checkbox]:text-sm peer-data-[slot=checkbox]:font-normal peer-data-[slot=checkbox]:tracking-normal peer-data-[slot=checkbox]:normal-case peer-data-[slot=radio-group-item]:text-sm peer-data-[slot=radio-group-item]:font-normal peer-data-[slot=radio-group-item]:tracking-normal peer-data-[slot=radio-group-item]:normal-case peer-data-[slot=switch]:text-sm peer-data-[slot=switch]:font-normal peer-data-[slot=switch]:tracking-normal peer-data-[slot=switch]:normal-case",
        className
      )}
      {...props}
    >
      {children}
      {required ? (
        <span
          data-slot="label-required"
          aria-hidden="true"
          className={cn("-ml-1.5 text-destructive", requiredClassName)}
        >
          *
        </span>
      ) : null}
    </LabelPrimitive.Root>
  )
}

export { Label }
export type { LabelProps }
