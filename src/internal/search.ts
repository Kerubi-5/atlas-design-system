/**
 * Case-fold and strip combining marks so "nino" matches "Niño". Shared by
 * Combobox and SearchPicker (which re-exports it).
 */
export function foldSearchText(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

/** Fold the query once; item labels are folded when their catalog changes. */
export function normalizeSearchQuery(query: string) {
  return foldSearchText(query.trim())
}

export function createSearchIndex<T>(
  items: T[],
  getLabel: (item: T) => string
) {
  return items.map((item) => ({ item, label: foldSearchText(getLabel(item)) }))
}

/**
 * The items whose folded label includes `needle` (a `normalizeSearchQuery`
 * result), in order; every item when `needle` is empty.
 */
export function filterSearchIndex<T>(
  index: ReturnType<typeof createSearchIndex<T>>,
  needle: string
) {
  if (!needle) return index.map(({ item }) => item)
  return index
    .filter(({ label }) => label.includes(needle))
    .map(({ item }) => item)
}
