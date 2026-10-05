"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

import { Button } from "./button.js"

type ErrorFallbackProps = {
  /** User-facing recovery copy. */
  message?: string
  onRetry?: () => void
  onReload?: () => void
}

/**
 * Presentational recovery UI used by `ErrorBoundary`. Exported so the markup
 * can be tested without throwing during render.
 */
export function ErrorFallback({
  message = "Something went wrong.",
  onRetry,
  onReload,
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      data-slot="error-boundary"
      className="flex flex-col items-center gap-4 rounded-none border border-dashed bg-muted/30 px-4 py-8 text-center"
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
    </div>
  )
}

type ErrorBoundaryProps = {
  children: ReactNode
  /** Overrides the default recovery message. */
  message?: string
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
