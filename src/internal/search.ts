import { foldSearchText } from "./listbox-navigation.js"

/** Fold the query once; item labels are folded when their catalog changes. */
export function normalizeSearchQuery(query: string) {
  return foldSearchText(query.trim())
}

export function matchesSearchLabel(label: string, needle: string) {
  return label.includes(needle)
}

export function createSearchIndex<T>(
  items: T[],
  getLabel: (item: T) => string
) {
  return items.map((item) => ({ item, label: foldSearchText(getLabel(item)) }))
}

export function filterSearchIndex<T>(
  index: ReturnType<typeof createSearchIndex<T>>,
  needle: string
) {
  return index
    .filter(({ label }) => matchesSearchLabel(label, needle))
    .map(({ item }) => item)
}
