"use client"

import type * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "./button.js"
import { cn } from "./utils.js"

type PeriodStepperFrameProps = {
  /** The range shown, announced when it changes. */
  label: React.ReactNode
  /** What one step moves ("month", "week"), for the button names. */
  stepLabel: string
  labelClassName?: string
} & Omit<React.ComponentProps<"div">, "children">

/**
 * Layout under both steppers. `control` renders each step as the element a
 * `Button` wraps (`asChild`), such as another router's link; returning
 * `null` for "today" drops that button.
 */
function PeriodStepperFrame({
  label,
  stepLabel,
  labelClassName,
  className,
  control,
  ...props
}: PeriodStepperFrameProps & {
  control: (
    step: "previous" | "today" | "next",
    content: React.ReactNode
  ) => React.ReactElement | null
}) {
  const today = control("today", "Today")
  return (
    <div
      data-slot="period-stepper"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={`Previous ${stepLabel}`}
        asChild
      >
        {control("previous", <ChevronLeft />)}
      </Button>
      {today ? (
        <Button variant="outline" size="sm" asChild>
          {today}
        </Button>
      ) : null}
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={`Next ${stepLabel}`}
        asChild
      >
        {control("next", <ChevronRight />)}
      </Button>
      <h2
        aria-live="polite"
        data-slot="period-stepper-label"
        className={cn("text-base font-semibold tabular-nums", labelClassName)}
      >
        {label}
      </h2>
    </div>
  )
}

/**
 * Previous / Today / Next buttons and the range they show (a month, a
 * week). The app owns the period; for URL-driven periods in Next use
 * `next/period-stepper`. Leave out `onToday` to drop the Today button.
 */
function PeriodStepper({
  onPrevious,
  onToday,
  onNext,
  ...props
}: PeriodStepperFrameProps & {
  onPrevious: () => void
  onToday?: () => void
  onNext: () => void
}) {
  const handlers = { previous: onPrevious, today: onToday, next: onNext }
  return (
    <PeriodStepperFrame
      {...props}
      control={(step, content) => {
        const onClick = handlers[step]
        return onClick ? (
          <button type="button" onClick={onClick}>
            {content}
          </button>
        ) : null
      }}
    />
  )
}

export { PeriodStepper, PeriodStepperFrame, type PeriodStepperFrameProps }
