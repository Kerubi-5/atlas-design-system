/** Page keys move ten rows, a little more than one max-h-60 list viewport. */
const PAGE_SIZE = 10

/** Return the next highlighted index for a listbox navigation key. */
export function moveListboxHighlight(
  key: string,
  index: number,
  length: number
): number | undefined {
  switch (key) {
    case "ArrowDown":
      return length === 0 ? 0 : Math.min(index + 1, length - 1)
    case "ArrowUp":
      return Math.max(index - 1, 0)
    case "Home":
      return 0
    case "End":
      return length === 0 ? 0 : length - 1
    case "PageDown":
      return length === 0 ? 0 : Math.min(index + PAGE_SIZE, length - 1)
    case "PageUp":
      return Math.max(index - PAGE_SIZE, 0)
    default:
      return undefined
  }
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
export function isComposingKey(event: {
  nativeEvent: KeyboardEvent
  keyCode: number
}) {
  return event.nativeEvent.isComposing || event.keyCode === 229
}
