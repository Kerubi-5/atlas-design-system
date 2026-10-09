import type { ComponentType } from "react"

import { slugify, titleFromExportName, titleFromFileName } from "./format.js"

export type StoryEntry = {
  id: string
  groupId: string
  group: string
  name: string
  Component: ComponentType
}

const modules = import.meta.glob("../../../stories/**/*.tsx", {
  eager: true,
}) as Record<string, Record<string, unknown>>

/**
 * Load every React component export under `stories/`.
 * New story files appear on the playground without a site change.
 */
export function loadStories(): StoryEntry[] {
  const stories: StoryEntry[] = []

  for (const [filePath, mod] of Object.entries(modules)) {
    const group = titleFromFileName(filePath)
    const groupId = slugify(group)

    for (const [exportName, value] of Object.entries(mod)) {
      if (typeof value !== "function") continue
      if (exportName === "default") continue
      const first = exportName.charAt(0)
      if (first !== first.toUpperCase()) continue

      const name = titleFromExportName(exportName)
      stories.push({
        id: slugify(`${groupId}-${name}`),
        groupId,
        group,
        name,
        Component: value as ComponentType,
      })
    }
  }

  return stories
}

export function groupStories(stories: StoryEntry[]) {
  const groups: { id: string; title: string; stories: StoryEntry[] }[] = []
  const indexById = new Map<string, number>()

  for (const story of stories) {
    const existing = indexById.get(story.groupId)
    if (existing === undefined) {
      indexById.set(story.groupId, groups.length)
      groups.push({ id: story.groupId, title: story.group, stories: [story] })
      continue
    }
    groups[existing]?.stories.push(story)
  }

  return groups
}
