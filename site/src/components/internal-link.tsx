import type { ComponentProps } from "react"

import { navigate } from "../lib/router.js"

type Props = ComponentProps<"a"> & { href: string }

/**
 * Client-side navigation for in-app paths. External hrefs keep native behavior.
 */
export function InternalLink({ href, onClick, ...props }: Props) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return
        }
        if (/^(https?:|mailto:)/.test(href)) return
        event.preventDefault()
        navigate(href)
      }}
    />
  )
}
