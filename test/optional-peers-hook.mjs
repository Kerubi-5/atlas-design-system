import { readFileSync } from "node:fs"

/**
 * Resolve hook that makes optional peers unresolvable, so a core entry fails
 * if it or one of its dependencies imports them.
 */
const { peerDependenciesMeta } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
)
const OPTIONAL_PEERS = new Set(
  Object.entries(peerDependenciesMeta)
    .filter(([, metadata]) => metadata.optional)
    .map(([name]) => name)
)

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
