"use client"

import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast, type ToasterProps } from "sonner"

import { buttonVariants } from "./button.js"
import { cn } from "./utils.js"

type ToastClassNames = NonNullable<
  NonNullable<ToasterProps["toastOptions"]>["classNames"]
>

/**
 * Toasts drawn entirely with kit classes. Sonner's own styles are unlayered
 * CSS that Tailwind utilities cannot override, so the toaster runs Sonner
 * `unstyled` and styles every part here: the popover surface, Alert-style
 * status icons (the tone colors the icon, title, and border, not the body
 * text), kit buttons for actions, and a labelled close button with the
 * shared focus ring.
 */
const classNames: ToastClassNames = {
  toast:
    "flex w-(--width) flex-wrap items-start justify-end gap-3 rounded-none border border-border bg-popover p-4 pr-10 text-sm text-popover-foreground shadow-lg",
  // Fills the row beside the icon, so action buttons wrap to their own row
  // (aligned right by the toast's justify-end).
  content: "flex min-w-0 flex-1 basis-[calc(100%-1.75rem)] flex-col gap-0.5",
  title: "font-medium leading-5",
  description: "leading-5 text-muted-foreground",
  icon: "mt-0.5 flex size-4 shrink-0 items-center justify-center [&_svg]:size-4",
  actionButton: cn(buttonVariants({ size: "xs" }), "shrink-0"),
  cancelButton: cn(
    buttonVariants({ variant: "outline", size: "xs" }),
    "shrink-0"
  ),
  closeButton: cn(
    buttonVariants({ variant: "ghost", size: "icon-xs" }),
    "absolute top-2 right-2 text-muted-foreground"
  ),
  success: "border-success/40 [&_[data-title]]:text-success",
  warning: "border-warning/40 [&_[data-title]]:text-warning",
  error: "border-destructive/40 [&_[data-title]]:text-destructive",
}

const icons: ToasterProps["icons"] = {
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

/** Merge app class names onto the kit's, part by part. */
function mergeClassNames(extra: ToastClassNames | undefined) {
  if (!extra) return classNames
  const merged: ToastClassNames = { ...classNames }
  for (const [part, value] of Object.entries(extra) as Array<
    [keyof ToastClassNames, string | undefined]
  >) {
    merged[part] = cn(classNames[part], value)
  }
  return merged
}

/**
 * Mount one near the app root and call `toast()` from this module (not from
 * `sonner` directly), so the app and the toaster always share one Sonner.
 */
const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      icons={icons}
      {...props}
      toastOptions={{
        ...toastOptions,
        unstyled: true,
        classNames: mergeClassNames(toastOptions?.classNames),
      }}
    />
  )
}

export { Toaster, toast }
export type { ToasterProps }
