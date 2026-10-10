"use client"

import { useState } from "react"

import { Label } from "../label.js"
import { Markdown } from "../markdown.js"
import { Textarea } from "../textarea.js"
import { ToggleGroup, ToggleGroupItem } from "../toggle-group.js"
import { onInputChange } from "../utils.js"

import { FieldError, getFieldErrorMessage } from "./field-error.js"
import type { TextFieldApi } from "./text-field.js"

type Mode = "write" | "preview"

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
  const errorText = showError
    ? getFieldErrorMessage(field.state.meta.errors[0])
    : undefined
  const trimmed = field.state.value.trim()

  function handleModeChange(value: string) {
    if (value === "write" || value === "preview") setMode(value)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
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
          <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {mode === "write" ? (
        <Textarea
          id={id}
          value={field.state.value}
          onChange={onChange}
          onBlur={field.handleBlur}
          placeholder={placeholder}
          rows={rows}
          aria-invalid={errorText ? true : undefined}
        />
      ) : (
        <div
          className="min-h-16 rounded-none border border-input bg-background px-3 py-2"
          aria-live="polite"
        >
          {trimmed ? (
            <Markdown content={trimmed} />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview</p>
          )}
        </div>
      )}

      {showError ? <FieldError text={errorText} /> : null}
    </div>
  )
}
