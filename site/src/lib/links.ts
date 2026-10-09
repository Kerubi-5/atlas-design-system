export const NPM_URL = "https://www.npmjs.com/package/atlas-react-kit"
export const GITHUB_URL = "https://github.com/Kerubi-5/atlas-design-system"
export const SITE_HOST = "design.querobines.com"

export type AppPath = "/" | "/playground" | "/tokens" | `/docs/${string}`

export const primaryNav: { href: AppPath; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/playground", label: "Playground" },
  { href: "/tokens", label: "Tokens" },
  { href: "/docs/readme", label: "Docs" },
]

/** True when a nav href should show the selected tab state. */
export function navItemIsActive(href: AppPath, pathname: string) {
  if (href === "/docs/readme") return pathname.startsWith("/docs/")
  return pathname === href
}
