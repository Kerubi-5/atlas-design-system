import * as React from "react"

import { cn } from "./utils.js"

/**
 * Padding lives in `--card-p` (set here, read by the sections) so plain
 * `py-*` / `px-*` classes on Card or its sections override it normally.
 * `flush` drops all padding so a list or table runs edge to edge.
 */
function Card({
  className,
  size = "default",
  flush = false,
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  flush?: boolean
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col overflow-hidden bg-card py-(--card-p) text-sm text-card-foreground shadow-sm ring-1 ring-foreground/5 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-none *:[img:last-child]:rounded-none",
        size === "sm"
          ? "gap-5 [--card-p:--spacing(5)]"
          : "gap-8 [--card-p:--spacing(8)]",
        flush && "[--card-p:0px]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-none px-(--card-p) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-p)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({
  as: Component = "div",
  className,
  ...props
}: React.ComponentProps<"div"> & { as?: "div" | "h1" }) {
  return (
    <Component
      data-slot="card-title"
      className={cn(
        "font-heading text-base font-semibold tracking-wider uppercase",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-p)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-(--card-p) [.border-t]:pt-(--card-p)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
