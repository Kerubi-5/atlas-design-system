import type { MouseEvent } from "react"
import { marked } from "marked"

import { isInternalPath, navigate } from "../lib/router.js"

/**
 * Render first-party kit markdown. Links are rewritten in `lib/docs.ts`
 * so in-repo files resolve to playground routes.
 */
export function MarkdownView({ markdown }: { markdown: string }) {
  const html = marked.parse(markdown, { gfm: true, async: false }) as string

  function onClick(event: MouseEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest("a")
    if (!target || event.defaultPrevented) return
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    const href = target.getAttribute("href")
    if (!href || !isInternalPath(href)) return
    event.preventDefault()
    navigate(href)
  }

  return (
    <div
      className="markdown overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={onClick}
    />
  )
}
