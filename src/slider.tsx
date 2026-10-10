"use client"

import { Slider as SliderPrimitive } from "radix-ui"

import { dataDisabledState, focusRing } from "./internal/styles.js"
import { cn } from "./utils.js"

export type SliderProps = {
  value: number
  onValueChange: (value: number) => void
  onValueCommit?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}

/**
 * Single-thumb range on Radix Slider. Square track and thumb, primary fill,
 * solid focus ring, 44px thumb hit area. Pair with a visible `Label`.
 */
function Slider({
  value,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  id,
  name,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      name={name}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
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
        className="relative h-1.5 w-full grow overflow-hidden rounded-none bg-muted"
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
        data-slot="slider-thumb"
        className={cn(
          focusRing,
          "relative block size-4 shrink-0 rounded-none border border-primary bg-background shadow-xs after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2"
        )}
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
