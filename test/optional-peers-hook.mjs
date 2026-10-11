/**
 * Resolve hook that makes optional feature libraries unresolvable, so a
 * core entry import fails if it (or anything it pulls in) still touches them.
 */
const OPTIONAL_PEERS = new Set([
  "date-fns",
  "next-themes",
  "react-day-picker",
  "react-markdown",
  "remark-gfm",
  "sonner",
])

/**
 * Bare specifier → package name (`@scope/name` or the first path segment).
 *
 * @param {string} specifier
 */
function packageName(specifier) {
  if (specifier.startsWith("@")) {
    const [scope, name] = specifier.split("/")
    return `${scope}/${name}`
  }
  return specifier.split("/")[0] ?? specifier
}

/**
 * @param {string} specifier
 * @param {object} context
 * @param {(specifier: string, context: object) => Promise<object>} nextResolve
 */
export async function resolve(specifier, context, nextResolve) {
  if (
    !specifier.startsWith(".") &&
    !specifier.startsWith("/") &&
    OPTIONAL_PEERS.has(packageName(specifier))
  ) {
    const error = new Error(`Cannot find module '${specifier}'`)
    error.code = "ERR_MODULE_NOT_FOUND"
    throw error
  }
  return nextResolve(specifier, context)
}
