import { createElement } from "react"
import { Button } from "storybook/internal/components"
import { addons, types } from "storybook/manager-api"
import { create } from "storybook/theming"

import { GITHUB_URL, NPM_URL } from "../src/lib/docs.js"

const KIT_TITLE = "Atlas React Kit"

// Storybook renders brandTitle as HTML when there is no brandImage. Keeping
// the name as live text (next to the favicon mark) uses the sidebar font and
// stays selectable, which an image wordmark would not. The HTML string is
// not used for document.title; applyKitDocumentTitle() sets the tab name.
const brandTitle = `<span style="display:inline-flex;align-items:center;gap:8px;font-weight:700"><img src="./favicon.svg" alt="" width="22" height="22" style="display:block" />${KIT_TITLE}</span>`

/**
 * Storybook hardcodes a "Storybook" tab suffix (`storybook - Storybook` on
 * the index, `{story} ⋅ Storybook` after navigation). Replace that brand
 * with the kit name so the manager tab matches the sidebar.
 */
function applyKitDocumentTitle() {
  const current = document.title
  if (!current || current === "Storybook") {
    document.title = KIT_TITLE
    return
  }
  if (/^storybook\s+-\s+Storybook$/i.test(current)) {
    document.title = KIT_TITLE
    return
  }
  if (current === `${KIT_TITLE} - Storybook`) {
    document.title = KIT_TITLE
    return
  }
  if (current.endsWith("Storybook") && !current.includes(KIT_TITLE)) {
    document.title = current.replace(
      /\s*[⋅·-]\s*Storybook$/u,
      ` ⋅ ${KIT_TITLE}`
    )
  }
}

if (typeof document !== "undefined") {
  applyKitDocumentTitle()
  const titleEl = document.querySelector("title")
  new MutationObserver(applyKitDocumentTitle).observe(
    titleEl ?? document.head,
    {
      childList: true,
      characterData: true,
      subtree: true,
    }
  )
}

/**
 * Component pages moved from `Components/<Name>` (and `Tokens`) into purpose
 * groups such as `Forms/<Name>`, which changed their ids. Send old links
 * (`?path=/story/components-button--variants`, `.../tokens--theme`) to the
 * same page in its group, looked up in the story index.
 */
async function redirectMovedPage() {
  const params = new URLSearchParams(window.location.search)
  const match = /^\/(docs|story)\/([a-z0-9-]+--[a-z0-9-]+)$/.exec(
    params.get("path") ?? ""
  )
  const [, kind, oldId] = match ?? []
  if (!kind || !oldId) return
  const response = await fetch("./index.json")
  if (!response.ok) return
  const { entries } = (await response.json()) as {
    entries: Record<string, { id: string; title: string }>
  }
  if (entries[oldId]) return
  const rest = oldId.replace(/^components-/, "")
  const slug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  const moved = Object.values(entries).find(
    (entry) => entry.id === `${slug(entry.title.split("/")[0] ?? "")}-${rest}`
  )
  if (!moved) return
  window.location.replace(
    window.location.href.replace(/([?&]path=)[^&#]*/, `$1/${kind}/${moved.id}`)
  )
}

if (typeof window !== "undefined") {
  redirectMovedPage().catch(() => {})
}

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle,
    brandUrl: "/",
    brandTarget: "_self",
    colorPrimary: "#7c3aed",
    colorSecondary: "#7c3aed",
  }),
})

/** Source and package links, kept on the right of the canvas toolbar. */
const links = [
  {
    id: "github",
    label: "GitHub",
    href: GITHUB_URL,
    // GitHub mark (Octicons mark-github, 16px).
    icon: "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z",
  },
  {
    id: "npm",
    label: "npm",
    href: NPM_URL,
    // npm's square "n" mark.
    icon: "M0 0v16h16V0Zm13 13h-2.5V5.5H8V13H3V3h10Z",
  },
]

addons.register("atlas/links", () => {
  for (const link of links) {
    addons.add(`atlas/links/${link.id}`, {
      type: types.TOOLEXTRA,
      title: link.label,
      // Storybook compiles the manager with the classic JSX runtime, so
      // build elements directly instead of relying on a React global.
      render: () =>
        createElement(
          Button,
          {
            asChild: true,
            variant: "ghost",
            padding: "small",
            ariaLabel: false,
          },
          createElement(
            "a",
            { href: link.href, target: "_blank", rel: "noreferrer" },
            createElement(
              "svg",
              {
                viewBox: "0 0 16 16",
                width: 14,
                height: 14,
                fill: "currentColor",
                "aria-hidden": true,
              },
              createElement("path", { d: link.icon })
            ),
            link.label
          )
        ),
    })
  }
})
