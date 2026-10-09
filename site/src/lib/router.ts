import { useEffect, useState } from "react"

import type { AppPath } from "./links.js"

/**
 * Minimal history router so the static site has real URLs without a
 * routing library. Vercel rewrites unknown paths to index.html.
 */
export function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname)
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])

  return pathname
}

export function navigate(href: string) {
  const url = new URL(href, window.location.origin)
  if (
    url.pathname === window.location.pathname &&
    url.hash === window.location.hash
  ) {
    return
  }
  window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`)
  window.dispatchEvent(new PopStateEvent("popstate"))
  if (!url.hash) window.scrollTo(0, 0)
}

export function isInternalPath(href: string): href is AppPath | string {
  return href.startsWith("/") && !href.startsWith("//")
}
