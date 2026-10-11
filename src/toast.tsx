"use client"

import type { ReactNode } from "react"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import {
  Toaster as Sonner,
  toast as sonnerToast,
  type ExternalToast,
  type ToasterProps as SonnerProps,
} from "sonner"

import { buttonVariants } from "./button.js"
import { cn } from "./utils.js"

/*
 * Apps use only the types and functions this module declares. Sonner draws
 * the toasts today, but none of its props, options, or types are part of the
 * public API, so it can be swapped without changing app code.
 */

/** Identifies a toast, to replace it in place or dismiss it. */
type ToastId = string | number

/** A button in a toast. Clicking it runs `onClick`, then closes the toast. */
interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastOptions {
  /** An existing toast's id replaces that toast, e.g. loading → success. */
  id?: ToastId
  /** A second, muted line under the message. */
  description?: ReactNode
  /** Milliseconds before it closes; `Number.POSITIVE_INFINITY` keeps it open. */
  duration?: number
  /** The primary button, such as "Undo" or "Retry". */
  action?: ToastAction
  /** A secondary outline button, such as "Dismiss". */
  cancel?: ToastAction
}

/** Shows a toast and returns its id. */
type ShowToast = (message: ReactNode, options?: ToastOptions) => ToastId

type Toast = ShowToast & {
  success: ShowToast
  info: ShowToast
  warning: ShowToast
  error: ShowToast
  /** A spinner toast that stays until it is replaced (same `id`) or dismissed. */
  loading: ShowToast
  /** Closes one toast by id, or every toast when called without one. */
  dismiss: (id?: ToastId) => void
}

type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

interface ToasterProps {
  /** Where toasts stack. Default `bottom-right`. */
  position?: ToastPosition
  /** A labelled close button on every toast. Default `true`. */
  closeButton?: boolean
  /** Keep the stack expanded instead of collapsed behind the newest toast. */
  expand?: boolean
  /** How many toasts show at once. Default 3. */
  visibleToasts?: number
  /** Milliseconds before a toast closes when it sets no `duration`. Default 4000. */
  duration?: number
}

/**
 * Copies only the kit's options, so plain JavaScript callers cannot hand the
 * library its own styling options (class names, `unstyled`, rich colors).
 */
function libraryOptions(options: ToastOptions = {}): ExternalToast {
  const { id, description, duration, action, cancel } = options
  return {
    id,
    description,
    duration,
    action: action && { label: action.label, onClick: () => action.onClick() },
    cancel: cancel && { label: cancel.label, onClick: () => cancel.onClick() },
  }
}

const show =
  (method: typeof sonnerToast.success): ShowToast =>
  (message, options) =>
    method(message, libraryOptions(options))

/**
 * Shows a toast through the app's one `Toaster`: `toast("Saved")`,
 * `toast.success(...)`, `toast.error(...)`. Returns its id.
 */
const toast: Toast = Object.assign(show(sonnerToast), {
  success: show(sonnerToast.success),
  info: show(sonnerToast.info),
  warning: show(sonnerToast.warning),
  error: show(sonnerToast.error),
  loading: show(sonnerToast.loading),
  dismiss: (id?: ToastId) => {
    sonnerToast.dismiss(id)
  },
})

/**
 * Toasts drawn entirely with kit classes. Sonner's own styles are unlayered
 * CSS that Tailwind utilities cannot override, so the toaster runs Sonner
 * `unstyled` and styles every part here.
 *
 * Icon policy: a plain `toast()` has no icon. `success`, `info`, `warning`,
 * `error`, and `loading` each show a status icon. Tone colors the icon, title,
 * and border (same approach as Alert), not the body text.
 *
 * Close button: ghost / icon-xs with muted text. Ghost sets no background, so
 * Sonner's unlayered `[data-button]` default (`background: var(--normal-text)`,
 * a foreground square) and the dark `[data-close-button]` rule (not gated on
 * `data-styled`) would win and hide the X under `text-muted-foreground`.
 * Important transparent / muted utilities beat those fills; hover and focus
 * tint the X only. `!` also pins position and size so a leftover
 * `data-close-button` transform cannot sit it on a corner.
 */
const classNames: NonNullable<SonnerProps["toastOptions"]>["classNames"] = {
  toast:
    "relative flex w-max max-w-[min(356px,calc(100vw-2rem))] flex-wrap items-center justify-end gap-x-3 gap-y-2 rounded-none border border-border bg-popover py-3 pr-11 pl-4 text-sm text-popover-foreground shadow-md",
  // Fills the row beside the icon, so action buttons wrap to their own row
  // (aligned right by the toast's justify-end). Without an icon the basis
  // falls back to the title's width, so a one-word toast stays compact.
  content:
    "flex min-w-0 flex-1 basis-full flex-col gap-1 [[data-icon]+&]:basis-[calc(100%-1.75rem)]",
  title: "font-medium leading-5",
  description: "leading-5 text-muted-foreground",
  icon: "flex size-4 shrink-0 items-center justify-center [&_svg]:size-4",
  actionButton: cn(buttonVariants({ size: "xs" }), "shrink-0"),
  cancelButton: cn(
    buttonVariants({ variant: "outline", size: "xs" }),
    "shrink-0"
  ),
  closeButton: cn(
    buttonVariants({ variant: "ghost", size: "icon-xs" }),
    "!absolute !top-1/2 !right-2 !left-auto !size-7 !-translate-y-1/2 !translate-x-0 !border-transparent !bg-transparent !text-muted-foreground !shadow-none hover:!border-transparent hover:!bg-transparent hover:!text-foreground focus-visible:!text-foreground"
  ),
  success: "border-success/40 [&_[data-title]]:text-success",
  info: "[&_[data-title]]:text-foreground",
  warning: "border-warning/40 [&_[data-title]]:text-warning",
  error: "border-destructive/40 [&_[data-title]]:text-destructive",
}

const icons: SonnerProps["icons"] = {
  success: <CircleCheckIcon aria-hidden className="text-success" />,
  info: <InfoIcon aria-hidden className="text-foreground" />,
  warning: <CircleAlertIcon aria-hidden className="text-warning" />,
  error: <CircleAlertIcon aria-hidden className="text-destructive" />,
  loading: (
    <LoaderCircleIcon
      aria-hidden
      className="animate-spin text-muted-foreground"
    />
  ),
  close: <XIcon aria-hidden />,
}

/**
 * Mount one near the app root, and show toasts with `toast()` from this
 * module. Only the props declared here reach the library.
 */
const Toaster = ({
  position,
  closeButton = true,
  expand,
  visibleToasts,
  duration,
}: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as SonnerProps["theme"]}
      className="toaster group"
      position={position}
      closeButton={closeButton}
      expand={expand}
      visibleToasts={visibleToasts}
      duration={duration}
      icons={icons}
      toastOptions={{ unstyled: true, classNames }}
    />
  )
}

export { Toaster, toast }
export type { ToastAction, ToastId, ToastOptions, ToastPosition, ToasterProps }
