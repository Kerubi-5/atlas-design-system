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
import { focusRing } from "./internal/styles.js"
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
  className?: string
}

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
}: InfoTipProps) {
  const [open, setOpen] = React.useState(false)
  const closeTimer = React.useRef<number | null>(null)
  const hoverOpened = React.useRef(false)
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
    hoverOpened.current = true
    setOpen(true)
  }

  const closeFromHover = () => {
    if (!canHoverOpen() || !hoverOpened.current) return
    cancelClose()
    // Leave a beat so the pointer can travel from the glyph into the panel.
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  React.useEffect(() => () => cancelClose(), [])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Hover already opened the panel; the following click should pin
        // it, not toggle it closed (Playwright and real mice both hover
        // before they click).
        if (hoverOpened.current && open && !next) {
          hoverOpened.current = false
          return
        }
        hoverOpened.current = false
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          data-slot="info-tip-trigger"
          data-layout={layout}
          className={cn(
            focusRing,
            "relative inline-flex shrink-0 items-center justify-center rounded-none text-muted-foreground hover:text-selected-foreground focus-visible:text-selected-foreground",
            inline
              ? "size-5 align-middle after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2"
              : "size-11",
            className
          )}
          onMouseEnter={openFromHover}
          onMouseLeave={closeFromHover}
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
        className="w-72"
        onMouseEnter={openFromHover}
        onMouseLeave={closeFromHover}
      >
        <PopoverHeader>
          <div className="flex items-start justify-between gap-2">
            {title ? <PopoverTitle>{title}</PopoverTitle> : null}
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
