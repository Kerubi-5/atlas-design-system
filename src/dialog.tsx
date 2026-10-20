"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import {
  overlayFade,
  overlayFadeZoom,
  overlaySurface,
} from "./internal/overlay-styles.js"
import { descriptionText } from "./internal/styles.js"
import { cn } from "./utils.js"
import { Button } from "./button.js"
import { XIcon } from "lucide-react"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        overlayFade,
        "fixed inset-0 isolate z-50 bg-black/20 supports-backdrop-filter:backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  overlayClassName,
  closeButtonClassName,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** Show the X close button in the top-right corner. Default `true`. */
  showCloseButton?: boolean
  /** Classes for the backdrop, e.g. a darker scrim. */
  overlayClassName?: string
  /** Classes for the built-in close button, e.g. its position. */
  closeButtonClassName?: string
}) {
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          overlaySurface,
          overlayFadeZoom,
          "fixed top-1/2 left-1/2 z-50 grid max-h-[90dvh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 overflow-y-auto p-6 text-sm outline-none",
          showCloseButton
            ? "[--dialog-close-gutter:--spacing(10)]"
            : "[--dialog-close-gutter:0px]",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close-button" asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "absolute top-4 right-4 text-muted-foreground hover:text-foreground",
                closeButtonClassName
              )}
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "pr-[var(--dialog-close-gutter,0px)] font-heading text-lg leading-none font-semibold tracking-wider uppercase",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "mt-0.5",
        descriptionText,
        "*:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
