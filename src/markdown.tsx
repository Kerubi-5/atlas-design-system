import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "./utils.js"

/** Stable identity so parent re-renders do not re-parse unchanged content. */
const REMARK_PLUGINS = [remarkGfm]

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:"])

/**
 * Drop javascript:/data:/unknown schemes. react-markdown already omits raw
 * HTML (no rehype-raw), so this is the remaining URL hole.
 */
export function safeMarkdownUrl(url: string) {
  const value = url.trim()
  if (!value) return ""
  if (value.startsWith("#") || value.startsWith("/")) return value
  try {
    const parsed = new URL(value)
    return SAFE_PROTOCOLS.has(parsed.protocol) ? value : ""
  } catch {
    return ""
  }
}

function headingClass(size: string) {
  return cn("font-heading font-semibold tracking-tight text-foreground", size)
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className={headingClass("text-xl")}>{children}</h1>,
  h2: ({ children }) => <h2 className={headingClass("text-lg")}>{children}</h2>,
  h3: ({ children }) => (
    <h3 className={headingClass("text-base")}>{children}</h3>
  ),
  p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-5 text-sm">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5 text-sm">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-input pl-3 text-sm text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) =>
    href ? (
      <a
        href={href}
        className="text-selected-foreground underline underline-offset-2"
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noreferrer noopener" }
          : {})}
      >
        {children}
      </a>
    ) : (
      <span>{children}</span>
    ),
  code: ({ className, children }) => {
    const fenced = /language-/.test(className ?? "")
    return (
      <code
        className={cn(
          "font-mono text-xs",
          fenced ? "bg-transparent" : "bg-muted px-1 py-0.5"
        )}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="overflow-x-auto bg-muted p-3 text-xs">{children}</pre>
  ),
  hr: () => <hr className="border-border" />,
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-input py-1.5 pr-3 font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border py-1.5 pr-3">{children}</td>
  ),
  img: ({ src, alt }) => (
    // src already passed through safeMarkdownUrl.
    <img src={src} alt={alt ?? ""} className="max-w-full" />
  ),
}

export type MarkdownProps = {
  content: string
  className?: string
}

/**
 * GitHub-flavoured Markdown, token-styled and sanitized. No Next, no raw
 * HTML, no typography plugin. `react-markdown` and `remark-gfm` stay in this
 * module so other subpaths do not pay for them.
 */
function Markdown({ content, className }: MarkdownProps) {
  return (
    <article
      data-slot="markdown"
      className={cn("flex flex-col gap-3 text-foreground", className)}
    >
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        urlTransform={safeMarkdownUrl}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}

/** Alias used by apps that imported MarkdownContent. */
const MarkdownContent = Markdown

export { Markdown, MarkdownContent }
