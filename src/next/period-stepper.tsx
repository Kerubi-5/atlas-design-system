"use client"

import Link from "next/link.js"

import {
  PeriodStepperFrame,
  type PeriodStepperFrameProps,
} from "../period-stepper.js"

/**
 * Next.js `PeriodStepper`: each step is a prefetched link, so the period
 * lives in the URL. Leave out `todayHref` to drop the Today link.
 */
function PeriodStepper({
  previousHref,
  todayHref,
  nextHref,
  ...props
}: PeriodStepperFrameProps & {
  previousHref: string
  todayHref?: string
  nextHref: string
}) {
  const hrefs = { previous: previousHref, today: todayHref, next: nextHref }
  return (
    <PeriodStepperFrame
      {...props}
      control={(step, content) => {
        const href = hrefs[step]
        return href ? (
          <Link href={href} prefetch>
            {content}
          </Link>
        ) : null
      }}
    />
  )
}

export { PeriodStepper }
