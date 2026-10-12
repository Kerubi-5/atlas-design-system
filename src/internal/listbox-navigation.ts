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
