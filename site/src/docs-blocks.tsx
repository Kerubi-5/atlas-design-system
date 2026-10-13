import {
  type ComponentProps,
  type PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  AnchorMdx,
  CodeOrSourceMdx,
  DocsContainer,
  type DocsContainerProps,
  HeadersMdx,
  Markdown,
} from "@storybook/addon-docs/blocks"

import { docsTheme, type SiteTheme } from "./lib/docs-theme.js"

/**
 * Wide content (props tables, markdown tables, code) scrolls inside this box
 * so the page itself never scrolls sideways. It is a named, focusable region
 * so keyboard users can scroll it with the arrow keys.
 */
export function ScrollRegion({
  label,
  className,
  ...props
}: ComponentProps<"div"> & { label: string }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={className ? `docs-scroll ${className}` : "docs-scroll"}
      {...props}
    />
  )
}

function MarkdownTable(props: ComponentProps<"table">) {
  return (
    <ScrollRegion label="Table">
      <table {...props} />
    </ScrollRegion>
  )
}

function MarkdownPre(props: ComponentProps<"pre">) {
  // A scrolling <pre> needs to take focus for keyboard scrolling.
  return <pre tabIndex={0} {...props} />
}

/**
 * Storybook's Markdown block with wide tables and code kept inside their own
 * scroll containers. Its `options` replace Storybook's default overrides, so
 * the code, link, and heading overrides are passed back in.
 */
export function DocsMarkdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <Markdown
        options={{
          overrides: {
            code: CodeOrSourceMdx,
            a: AnchorMdx,
            ...HeadersMdx,
            table: MarkdownTable,
            pre: MarkdownPre,
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  )
}

/** The preview's docs context carries its store at runtime; it is untyped. */
type WithStore = {
  store?: { userGlobals?: { get(): Record<string, unknown> } }
}

function themeOf(globals: Record<string, unknown> | undefined): SiteTheme {
  return globals?.theme === "dark" ? "dark" : "light"
}

/**
 * Docs pages follow the theme toolbar. Pages with stories get the `dark`
 * class from the story decorator, but MDX pages have no stories, so the
 * container applies it, and hands Storybook's docs blocks a theme built from
 * the kit tokens.
 */
export function KitDocsContainer({
  children,
  context,
  ...props
}: PropsWithChildren<DocsContainerProps>) {
  const [theme, setTheme] = useState<SiteTheme>(() =>
    themeOf((context as unknown as WithStore).store?.userGlobals?.get())
  )
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = ({ globals }: { globals?: Record<string, unknown> }) =>
      setTheme(themeOf(globals))
    context.channel.on("globalsUpdated", update)
    return () => context.channel.off("globalsUpdated", update)
  }, [context.channel])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const fix = () => {
      // The object control's JSON tree renders its root <li> straight inside
      // a <div>. Give that div list semantics so the markup is a valid list.
      for (const tree of root.querySelectorAll(".rejt-tree:not([role])")) {
        tree.setAttribute("role", "list")
      }
      // A story preview whose demo outgrows it (e.g. a fixed-height column at
      // 390px) scrolls; let keyboard users focus it to scroll.
      for (const story of root.querySelectorAll<HTMLElement>(".docs-story")) {
        const scrolls =
          story.scrollWidth > story.clientWidth ||
          story.scrollHeight > story.clientHeight
        if (scrolls && !story.hasAttribute("tabindex")) {
          story.tabIndex = 0
          story.setAttribute("role", "region")
          story.setAttribute("aria-label", "Story preview")
        }
      }
    }
    fix()
    void document.fonts.ready.then(fix)
    const observer = new MutationObserver(fix)
    observer.observe(root, { childList: true, subtree: true })
    window.addEventListener("resize", fix)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", fix)
    }
  }, [])

  return (
    <div ref={rootRef} className="contents">
      <DocsContainer {...props} context={context} theme={docsTheme(theme)}>
        {children}
      </DocsContainer>
    </div>
  )
}
