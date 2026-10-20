import { clamp } from "./math.js"

/** Page keys move ten rows, a little more than one max-h-60 list viewport. */
const PAGE_SIZE = 10

/** Rows each key moves the highlight; Home and End jump to the ends. */
const keySteps = new Map([
  ["ArrowDown", 1],
  ["ArrowUp", -1],
  ["PageDown", PAGE_SIZE],
  ["PageUp", -PAGE_SIZE],
  ["Home", -Infinity],
  ["End", Infinity],
])

/** Return the next highlighted index for a listbox navigation key. */
function moveListboxHighlight(
  key: string,
  index: number,
  length: number
): number | undefined {
  const step = keySteps.get(key)
  if (step === undefined) return undefined
  return clamp(index + step, 0, Math.max(length - 1, 0))
}

/**
 * Option id for `aria-activedescendant`. Index-based because option values
 * may contain spaces, which are not valid in an id reference.
 */
export function listboxOptionId(listId: string, index: number) {
  return `${listId}-option-${index}`
}

/**
 * Callback ref for the highlighted option. It runs when the option mounts
 * (including when a popover first renders the list) and when the highlight
 * moves, keeping the option in view inside the overflow list. Module-level,
 * so the ref is stable without `useCallback`.
 */
export function scrollOptionIntoView(node: HTMLElement | null) {
  node?.scrollIntoView({ block: "nearest" })
}

/**
 * True while an IME is composing (Japanese, Chinese, Korean input). Enter
 * then commits the composition and must not select an option. `keyCode`
 * 229 covers Safari, which ends composition before the keydown.
 */
function isComposingKey(event: {
  nativeEvent: KeyboardEvent
  keyCode: number
}) {
  return event.nativeEvent.isComposing || event.keyCode === 229
}

/**
 * Shared keydown for a search input that drives a listbox: navigation keys
 * move the highlight, Enter picks the highlighted index. Returns `true` when
 * the key is handled (or an IME is composing, when every key belongs to the
 * IME), so the caller can stop; `false` leaves the key to the caller (for
 * example SearchPicker's Escape).
 */
export function handleListboxKey(
  event: {
    key: string
    keyCode: number
    nativeEvent: KeyboardEvent
    preventDefault: () => void
  },
  {
    highlight,
    length,
    setHighlight,
    onEnter,
  }: {
    highlight: number
    length: number
    setHighlight: (index: number) => void
    onEnter: (index: number) => void
  }
): boolean {
  if (isComposingKey(event)) return true
  const next = moveListboxHighlight(event.key, highlight, length)
  if (next !== undefined) {
    event.preventDefault()
    setHighlight(next)
    return true
  }
  if (event.key === "Enter") {
    event.preventDefault()
    onEnter(highlight)
    return true
  }
  return false
}
