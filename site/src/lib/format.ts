/** Convert a file or export name into a stable URL slug. */
export function slugify(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
}

/** Human title from a stories/ filename (`button-hover` → `Button hover`). */
export function titleFromFileName(filePath: string) {
  const base =
    filePath
      .split("/")
      .pop()
      ?.replace(/\.tsx$/, "") ?? filePath
  return base
    .split("-")
    .map((part, index) =>
      index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
    )
    .join(" ")
}

/** Human title from a story export (`ButtonVariantsStory` → `Button variants`). */
export function titleFromExportName(name: string) {
  const trimmed = name.replace(/Story$/, "")
  const spaced = trimmed.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
