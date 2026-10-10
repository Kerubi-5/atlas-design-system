import { Button } from "../src/button.js"

const variants = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const

/** Resting Button variants, including the quiet outline used for Clear. */
export function ButtonVariantsStory() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <Button key={variant} type="button" variant={variant}>
          {variant}
        </Button>
      ))}
      <Button type="button" variant="outline" size="sm">
        Clear selection
      </Button>
    </div>
  )
}

/**
 * Outline and ghost on the selected wash — the KairOS "Clear selection"
 * case. Hover/focus must not paint a muted grey fill on this background.
 */
export function OutlineOnSelectedStory() {
  return (
    <div className="flex items-center justify-between gap-4 bg-selected px-4 py-3 text-selected-foreground">
      <p className="text-sm font-medium">2 categories selected</p>
      <Button type="button" variant="outline" size="sm">
        Clear selection
      </Button>
    </div>
  )
}

/**
 * Static stand-in for `:hover` + `:focus-visible` so tests and captures can
 * assert the purple chrome and the solid focus ring without a pointer.
 */
export function QuietButtonHoverStory() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-ring bg-selected text-selected-foreground ring-2 ring-ring"
      >
        Clear selection
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="border-ring bg-selected text-selected-foreground ring-2 ring-ring"
      >
        Ghost
      </Button>
    </div>
  )
}
