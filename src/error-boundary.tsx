"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

import { Button } from "./button.js"
import { EmptyPanel } from "./empty-panel.js"
import { cn } from "./utils.js"

type ErrorFallbackProps = {
  /** User-facing recovery copy. Default "Something went wrong.". */
  message?: string
  /** Shows a "Try again" button that calls this. Hidden when omitted. */
  onRetry?: () => void
  /** Shows a "Reload" button that calls this. Hidden when omitted. */
  onReload?: () => void
  /** Classes for the panel. */
  className?: string
}

/**
 * Presentational recovery UI used by `ErrorBoundary`: a large `EmptyPanel`
 * with the message and recovery buttons. Exported so the markup can be
 * tested without throwing during render.
 */
export function ErrorFallback({
  message = "Something went wrong.",
  onRetry,
  onReload,
  className,
}: ErrorFallbackProps) {
  return (
    <EmptyPanel
      role="alert"
      data-slot="error-boundary"
      size="lg"
      // The panel's muted text is for its message; the buttons keep their own.
      className={cn(
        "flex flex-col items-center gap-4 text-foreground",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        {onReload ? (
          <Button type="button" size="sm" onClick={onReload}>
            Reload
          </Button>
        ) : null}
      </div>
    </EmptyPanel>
  )
}

type ErrorBoundaryProps = {
  /** Content to render until it throws. */
  children: ReactNode
  /** Overrides the default recovery message. */
  message?: string
  /** Called with the caught error and its component stack, e.g. to log it. */
  onError?: (error: Error, info: ErrorInfo) => void
}

type ErrorBoundaryState = {
  error: Error | null
}

/**
 * Generic React error boundary with retry (reset) and full-page reload.
 * Not tied to any data library.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  retry = () => {
    this.setState({ error: null })
  }

  reload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <ErrorFallback
        message={this.props.message}
        onRetry={this.retry}
        onReload={this.reload}
      />
    )
  }
}
