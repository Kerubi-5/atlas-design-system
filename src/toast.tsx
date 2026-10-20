"use client"

import { useState, type FocusEvent, type ReactNode } from "react"
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
import { statusTone } from "./internal/styles.js"
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
  /** The button's text. */
  label: string
  /** Runs when the button is clicked, before the toast closes. */
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
  /** A toast with a check icon and a success-toned title and border. */
  success: ShowToast
  /** A toast with an info icon. */
  info: ShowToast
  /** A toast with an alert icon and a warning-toned title and border. */
  warning: ShowToast
  /** A toast with an alert icon and a destructive-toned title and border. */
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
  /** Keep the stack expanded instead of collapsed behind the newest toast. Default `false`. */
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
 * and border (`statusTone`, shared with Alert), not the body text.
 *
 * Close button: a circular badge centred on the top-right corner (`-top-2
 * -right-2`, half outside the border). Ghost / icon-xs still supplies the
 * shared focus ring, but Sonner's unlayered `[data-button]` default
 * (`background: var(--normal-text)`) and the dark `[data-close-button]` rule
 * (not gated on `data-styled`) would paint a foreground square. Important
 * popover fill, border, and muted text beat those fills. The 24px hit area
 * is the badge itself; the X is 12px. `overflow-visible` on the toast and
 * toaster keeps stacked badges from being clipped.
 *
 * Stacking: while the stack is collapsed, every part of the toasts behind
 * the front one is `invisible`. Their badges would otherwise peek out above
 * the front toast, closer together than the 24px target spacing, and their
 * buttons would stay in the tab order unseen. Hovering or focusing the stack
 * expands it (see `Toaster`), which shows them again.
 *
 * Padding is asymmetric: `pl-4` matches Alert; `pr-6` clears the badge
 * (about 16px of it sits inside the border). Icon-to-text is `gap-x-2.5`
 * so the status icon and copy read as one unit.
 */
const classNames: NonNullable<SonnerProps["toastOptions"]>["classNames"] = {
  toast:
    "relative flex w-max max-w-[min(356px,calc(100vw-2rem))] flex-wrap items-center justify-end gap-x-2.5 gap-y-2 overflow-visible rounded-none border border-border bg-popover py-3 pl-4 pr-6 text-sm text-popover-foreground shadow-md data-[expanded=false]:data-[front=false]:*:invisible",
  // Fills the row beside the icon, so action buttons wrap to their own row
  // (aligned right by the toast's justify-end). Without an icon the basis
  // falls back to the title's width, so a one-word toast stays compact.
  // 1.625rem = 16px icon + 10px gap-x-2.5.
  content:
    "flex min-w-0 flex-1 basis-full flex-col gap-1 [[data-icon]+&]:basis-[calc(100%-1.625rem)]",
  title: "font-medium leading-5 text-(--status-tone)",
  description: "leading-5 text-muted-foreground",
  icon: "flex size-4 shrink-0 items-center justify-center [&_svg]:size-4",
  actionButton: cn(buttonVariants({ size: "xs" }), "shrink-0"),
  cancelButton: cn(
    buttonVariants({ variant: "outline", size: "xs" }),
    "shrink-0"
  ),
  closeButton: cn(
    buttonVariants({ variant: "ghost", size: "icon-xs" }),
    "!absolute !-top-2 !-right-2 !left-auto !z-10 !size-6 !rounded-full !border !border-border !bg-popover !p-0 !text-muted-foreground !shadow-xs !translate-x-0 !translate-y-0 hover:!border-border hover:!bg-popover hover:!text-foreground focus-visible:!text-foreground active:!translate-y-0 [&_svg]:!size-3"
  ),
  success: statusTone.success,
  info: statusTone.neutral,
  warning: statusTone.warning,
  error: statusTone.destructive,
}

const icons: SonnerProps["icons"] = {
  success: <CircleCheckIcon aria-hidden className="text-(--status-tone)" />,
  info: <InfoIcon aria-hidden className="text-(--status-tone)" />,
  warning: <CircleAlertIcon aria-hidden className="text-(--status-tone)" />,
  error: <CircleAlertIcon aria-hidden className="text-(--status-tone)" />,
  loading: (
    <LoaderCircleIcon
      aria-hidden
      className="animate-spin text-muted-foreground"
    />
  ),
  close: <XIcon aria-hidden className="size-3" />,
}

/**
 * Mount one near the app root, and show toasts with `toast()` from this
 * module. Only the props declared here reach the library. The stack
 * expands while keyboard focus is inside it, as it does on hover, so every
 * toast's buttons are visible and reachable.
 */
const Toaster = ({
  position,
  closeButton = true,
  expand,
  visibleToasts,
  duration,
}: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const [focusWithin, setFocusWithin] = useState(false)
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusWithin(false)
    }
  }

  return (
    <div
      data-slot="toaster"
      className="contents"
      onFocus={() => setFocusWithin(true)}
      onBlur={onBlur}
    >
      <Sonner
        theme={theme as SonnerProps["theme"]}
        className="toaster group overflow-visible"
        position={position}
        closeButton={closeButton}
        expand={expand || focusWithin}
        visibleToasts={visibleToasts}
        duration={duration}
        icons={icons}
        toastOptions={{ unstyled: true, classNames }}
      />
    </div>
  )
}

export { Toaster, toast }
export type { ToastAction, ToastId, ToastOptions, ToastPosition, ToasterProps }
