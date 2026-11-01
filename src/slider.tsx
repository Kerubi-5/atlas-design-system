"use client"

import type * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { dataDisabledState, focusRing, hitArea44 } from "./internal/styles.js"
import { cn } from "./utils.js"

export type SliderProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "onValueCommit" | "children"
> & {
  /** The current value; the slider is always controlled. */
  value: number
  /** Called with the new value on every move while dragging or on a key press. */
  onValueChange: (value: number) => void
  /** Called with the final value when a drag ends or a key press settles. */
  onValueCommit?: (value: number) => void
  /** The lowest value. Default 0. */
  min?: number
  /** The highest value. Default 100. */
  max?: number
  /** The amount each move snaps to. Default 1. */
  step?: number
  /** Dims the slider and ignores pointer and keyboard input. */
  disabled?: boolean
  /** Goes on the thumb, so a `<Label htmlFor>` names the slider. */
  id?: string
  /** Form field name, so the value submits with a surrounding `<form>`. */
  name?: string
  /** Classes for the root, e.g. its width. */
  className?: string
  /** Names the slider when there is no `<Label htmlFor={id}>`. Goes on the thumb. */
  "aria-label"?: string
  /** Id of the element that names the slider. Goes on the thumb. */
  "aria-labelledby"?: string
}

/**
 * Single-thumb range on Radix Slider. Square track and thumb, primary fill,
 * solid focus ring, 44px thumb hit area. Pair with a visible `Label`. Other
 * props (`orientation`, `inverted`, `data-*`) go to the Radix root; `id`
 * and the accessible name, description, value text, and error attributes go
 * to the thumb.
 */
function Slider({
  value,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-valuetext": ariaValueText,
  "aria-invalid": ariaInvalid,
  "aria-errormessage": ariaErrorMessage,
  ...props
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      {...props}
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={(next) => {
        const amount = next[0]
        if (amount !== undefined) onValueChange(amount)
      }}
      onValueCommit={(next) => {
        const amount = next[0]
        if (amount !== undefined) onValueCommit?.(amount)
      }}
      className={cn(
        dataDisabledState,
        "relative flex w-full touch-none items-center select-none",
        className
      )}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden rounded-none bg-input"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-primary"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-valuetext={ariaValueText}
        aria-invalid={ariaInvalid}
        aria-errormessage={ariaErrorMessage}
        data-slot="slider-thumb"
        className={cn(
          focusRing,
          hitArea44,
          "relative block size-4 shrink-0 rounded-none border border-primary bg-background shadow-xs"
        )}
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
