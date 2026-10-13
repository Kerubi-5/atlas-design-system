"use client"

import * as React from "react"
import { CircleHelpIcon } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover.js"
import { focusRing, hitArea44 } from "./internal/styles.js"
import { cn } from "./utils.js"

export type InfoTipLayout = "box" | "inline"

export type InfoTipProps = {
  /** Required name for the icon button (the glyph has no visible text). */
  label: string
  title?: string
  description?: React.ReactNode
  /** Extra body after the title and description. */
  children?: React.ReactNode
  /** `inline` keeps the surrounding line height; the 44px hit area overflows. */
  layout?: InfoTipLayout
  side?: React.ComponentProps<typeof PopoverContent>["side"]
  align?: React.ComponentProps<typeof PopoverContent>["align"]
  badge?: React.ReactNode
  icon?: React.ReactNode
  /** Classes for the trigger button. */
  className?: string
  /** Classes for the panel, e.g. its width. Defaults to `w-72`. */
  contentClassName?: string
} & Omit<
  React.ComponentProps<"button">,
  // `title` names the panel; the pointer and click handlers run the
  // hover-open logic.
  "title" | "children" | "type" | "onMouseEnter" | "onMouseLeave" | "onClick"
>

/**
 * True when a mouse can hover. Touch and coarse pointers must use click;
 * a hover-open popover would trap them after the first tap.
 */
function canHoverOpen() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches
}

/**
 * Longer help than a Tooltip: a Popover with a 20px glyph and a 44px hit
 * area. Hover opens only on a fine pointer; click, tap, and keyboard always
 * toggle it. Not a glossary or "coming soon" chip — pass that copy in.
 */
function InfoTip({
  label,
  title,
  description,
  children,
  layout = "box",
  side = "top",
  align = "center",
  badge,
  icon,
  className,
  contentClassName,
  ...props
}: InfoTipProps) {
  const [open, setOpen] = React.useState(false)
  const closeTimer = React.useRef<number | null>(null)
  // How the panel last opened. A hover-open leaves focus where it was and
  // closes when the pointer leaves; a click (or keyboard) open pins it.
  const openedBy = React.useRef<"hover" | "click" | null>(null)
  const titleId = React.useId()
  const inline = layout === "inline"

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const openFromHover = () => {
    if (!canHoverOpen()) return
    cancelClose()
    if (open) return
    openedBy.current = "hover"
    setOpen(true)
  }

  const closeFromHover = () => {
    if (!canHoverOpen() || openedBy.current !== "hover") return
    cancelClose()
    // Leave a beat so the pointer can travel from the glyph into the panel.
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  React.useEffect(() => () => cancelClose(), [])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Escape and outside clicks close however the panel opened. Keep
        // `openedBy` on close so onCloseAutoFocus can read it.
        cancelClose()
        if (next) openedBy.current = "click"
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <button
          {...props}
          type="button"
          aria-label={label}
          data-slot="info-tip-trigger"
          data-layout={layout}
          className={cn(
            focusRing,
            "relative inline-flex shrink-0 items-center justify-center rounded-none text-muted-foreground hover:text-selected-foreground focus-visible:text-selected-foreground",
            inline ? cn("size-5 align-middle", hitArea44) : "size-11",
            className
          )}
          onMouseEnter={openFromHover}
          onMouseLeave={closeFromHover}
          onClick={(event) => {
            // Hover already opened the panel; this click pins it instead of
            // toggling it closed (Playwright and real mice both hover before
            // they click). Preventing default skips Radix's toggle.
            if (open && openedBy.current === "hover") {
              event.preventDefault()
              cancelClose()
              openedBy.current = "click"
            }
          }}
        >
          {icon ?? (
            <CircleHelpIcon
              className="size-5"
              data-icon="info-tip"
              aria-hidden
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className={cn("w-72", contentClassName)}
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        // A pointer passing over the glyph must not take focus from where
        // the user is typing, nor hand it to the trigger on close.
        onOpenAutoFocus={(event) => {
          if (openedBy.current === "hover") event.preventDefault()
        }}
        onCloseAutoFocus={(event) => {
          if (openedBy.current === "hover") event.preventDefault()
        }}
        onMouseEnter={openFromHover}
        onMouseLeave={closeFromHover}
      >
        <PopoverHeader>
          <div className="flex items-start justify-between gap-2">
            {title ? <PopoverTitle id={titleId}>{title}</PopoverTitle> : null}
            {badge}
          </div>
          {description ? (
            <PopoverDescription>{description}</PopoverDescription>
          ) : null}
        </PopoverHeader>
        {children}
      </PopoverContent>
    </Popover>
  )
}

/** InfoTip that sits in a line of text without stretching the line box. */
function InlineTip(props: Omit<InfoTipProps, "layout">) {
  return <InfoTip {...props} layout="inline" />
}

export { InfoTip, InlineTip }
