import { EmptyPanel } from "../src/empty-panel.js"
import { ErrorFallback } from "../src/error-boundary.js"
import { Separator } from "../src/separator.js"
import { Skeleton } from "../src/skeleton.js"

/** Dashed empty states at the three paddings. */
export function EmptyPanelStory() {
  return (
    <div className="grid gap-3">
      <EmptyPanel size="sm">No filters yet</EmptyPanel>
      <EmptyPanel>Nothing to show</EmptyPanel>
      <EmptyPanel size="lg" muted={false}>
        Large, unfilled empty state
      </EmptyPanel>
    </div>
  )
}

/** Loading placeholders next to a hairline rule. */
export function SkeletonAndSeparatorStory() {
  return (
    <div className="grid max-w-sm gap-3">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-32" />
      <Separator />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

/** Recovery chrome without throwing during render. */
export function ErrorFallbackStory() {
  return (
    <ErrorFallback
      message="Could not load this panel."
      onRetry={() => {}}
      onReload={() => {}}
    />
  )
}
