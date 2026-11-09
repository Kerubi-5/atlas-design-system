import { cn } from "./utils.js"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-skeleton", className)}
      {...props}
    />
  )
}

export { Skeleton }
