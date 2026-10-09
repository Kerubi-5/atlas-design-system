import { EmptyPanel } from "../../../src/empty-panel.js"

import { groupStories, loadStories } from "../lib/stories.js"

const stories = loadStories()
const groups = groupStories(stories)

export function PlaygroundPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
      <nav aria-label="Stories" className="lg:sticky lg:top-24 lg:self-start">
        <p className="font-heading text-xs font-semibold tracking-widest uppercase">
          Stories
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Globbed from <code className="bg-muted px-1">stories/</code>
        </p>
        <ul className="mt-4 grid gap-1 text-sm">
          {groups.map((group) => (
            <li key={group.id}>
              <a
                href={`#${group.id}`}
                className="block px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {group.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-10">
        {groups.length === 0 ? (
          <EmptyPanel>No stories found under stories/.</EmptyPanel>
        ) : (
          groups.map((group) => (
            <section
              key={group.id}
              id={group.id}
              className="grid scroll-mt-24 gap-4"
            >
              <h2 className="font-heading text-base font-semibold tracking-wider uppercase">
                {group.title}
              </h2>
              {group.stories.map((story) => (
                <article
                  key={story.id}
                  id={story.id}
                  className="grid scroll-mt-24 gap-3"
                >
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {story.name}
                  </h3>
                  <div className="overflow-x-auto bg-muted/30 p-6 ring-1 ring-border">
                    <story.Component />
                  </div>
                </article>
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  )
}
