"use client"

import { lazy, Suspense, useState } from "react"

import { Spinner } from "../spinner.js"
import { Textarea } from "../textarea.js"
import { ToggleGroup, ToggleGroupItem } from "../toggle-group.js"
import { fieldSurface } from "../internal/styles.js"
import { cn, onInputChange } from "../utils.js"

import { FormFieldShell, invalidWhen, metaErrorText } from "./field-shell.js"
import type { TextFieldApi } from "./text-field.js"

type Mode = "write" | "preview"

// The renderer (react-markdown + remark-gfm) is fetched the first time
// Preview is shown or hovered, so a form in Write mode stays light.
const loadMarkdown = () => import("../markdown.js")
const preloadMarkdown = () => void loadMarkdown()
const Markdown = lazy(() =>
  loadMarkdown().then((module) => ({ default: module.Markdown }))
)

/**
 * GFM body field: Write is a textarea, Preview is the sanitized Markdown
 * renderer. String-in/string-out — not a WYSIWYG document model.
 */
export function FormMarkdownField({
  field,
  id = field.name,
  label,
  placeholder = "Markdown supported",
  rows = 5,
  showError = true,
}: {
  field: TextFieldApi
  /**
   * Control id the label points at. Defaults to `field.name`; pass a unique
   * id when two forms on one page share a field name.
   */
  id?: string
  label: string
  placeholder?: string
  rows?: number
  showError?: boolean
}) {
  const [mode, setMode] = useState<Mode>("write")
  const onChange = onInputChange(field.handleChange)
  const errorText = showError ? metaErrorText(field.state.meta) : undefined
  const trimmed = field.state.value.trim()

  function handleModeChange(value: string) {
    if (value === "write" || value === "preview") setMode(value)
  }

  return (
    <FormFieldShell
      id={id}
      label={label}
      errorText={errorText}
      labelAction={
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={handleModeChange}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label={`${label} mode`}
        >
          <ToggleGroupItem value="write">Write</ToggleGroupItem>
          <ToggleGroupItem
            value="preview"
            onPointerEnter={preloadMarkdown}
            onFocus={preloadMarkdown}
          >
            Preview
          </ToggleGroupItem>
        </ToggleGroup>
      }
    >
      {mode === "write" ? (
        <Textarea
          id={id}
          value={field.state.value}
          onChange={onChange}
          onBlur={field.handleBlur}
          placeholder={placeholder}
          rows={rows}
          aria-invalid={invalidWhen(errorText)}
        />
      ) : (
        <div className={cn(fieldSurface, "min-h-16")} aria-live="polite">
          {trimmed ? (
            <Suspense fallback={<Spinner aria-label="Loading preview" />}>
              <Markdown content={trimmed} />
            </Suspense>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview</p>
          )}
        </div>
      )}
    </FormFieldShell>
  )
}
