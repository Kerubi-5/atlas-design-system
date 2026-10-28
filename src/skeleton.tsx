import { cn } from "./utils.js"

/**
 * Loading placeholder shaped like the content it stands in for. Uses the
 * muted fill so the pulse reads as a light gray wash, not the mid-gray
 * input-boundary token (`bg-input`) that fields, separators and tracks
 * share for 3:1 contrast.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
