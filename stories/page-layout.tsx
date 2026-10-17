import * as React from "react"

import { Button } from "../src/button.js"
import { PageHeader } from "../src/page-header.js"
import { PeriodStepper } from "../src/period-stepper.js"
import { SkipLink } from "../src/skip-link.js"

const months = [
  "August 2026",
  "September 2026",
  "October 2026",
  "November 2026",
]

/** A page top: skip link, title row with an action, and a month stepper. */
export function PageLayoutStory() {
  const [month, setMonth] = React.useState(2)
  return (
    <div className="relative flex flex-col gap-6">
      <SkipLink href="#story-main" />
      <PageHeader
        title="Budget"
        description="Spending pace, limits, and entries"
        actions={<Button size="sm">Add entry</Button>}
      />
      <PeriodStepper
        label={months[month]}
        stepLabel="month"
        onPrevious={() => setMonth((m) => Math.max(0, m - 1))}
        onToday={() => setMonth(2)}
        onNext={() => setMonth((m) => Math.min(months.length - 1, m + 1))}
      />
      <main id="story-main" className="text-sm text-muted-foreground">
        Page content
      </main>
    </div>
  )
}
