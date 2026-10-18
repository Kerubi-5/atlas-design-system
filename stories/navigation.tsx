import { cn } from "../src/utils.js"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsNav,
  TabsTrigger,
  tabsTriggerVariants,
} from "../src/tabs.js"

/** KairOS Settings labels — long enough to overflow a 390px row. */
const SETTINGS_LINKS = [
  "Activity",
  "Preferences",
  "Notifications",
  "API Tokens",
  "Calendar feed",
  "Apple Reminders",
] as const

function settingsSlug(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-")
}

/** Default and line tab lists with panels. */
export function TabsStory() {
  return (
    <div className="grid gap-8">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="activity">Activity panel</TabsContent>
      </Tabs>
      <Tabs defaultValue="list">
        <TabsList variant="line">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
        </TabsList>
        <TabsContent value="list">List panel</TabsContent>
        <TabsContent value="board">Board panel</TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Many triggers in a 390px panel — same overflow case as TabsNav.
 */
export function TabsOverflowStory() {
  return (
    <div className="w-[390px] max-w-full border border-border p-3">
      <Tabs defaultValue="activity">
        <TabsList>
          {SETTINGS_LINKS.map((label) => (
            <TabsTrigger key={label} value={settingsSlug(label)}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="activity">
          Recent tool calls from the CLI and agents.
        </TabsContent>
      </Tabs>
    </div>
  )
}

type SettingsLink = (typeof SETTINGS_LINKS)[number]

/** URL-style tab links; the active item uses aria-current. */
export function TabsNavStory({
  active = "Activity",
  className,
}: {
  active?: SettingsLink
  className?: string
} = {}) {
  return (
    <TabsNav aria-label="Settings" className={className}>
      {SETTINGS_LINKS.map((label) => {
        const isActive = label === active
        return (
          <a
            key={label}
            href={`#${settingsSlug(label)}`}
            aria-current={isActive ? "page" : undefined}
            data-state={isActive ? "active" : "inactive"}
            className={cn(tabsTriggerVariants())}
          >
            {label}
          </a>
        )
      })}
    </TabsNav>
  )
}

/**
 * The KairOS Settings case: six links in a 390px column. The kit owns
 * overflow; apps should not pass `overflow-x-auto` on `TabsNav`.
 */
export function TabsNavNarrowStory() {
  return (
    <div className="w-[390px] max-w-full border border-border p-3">
      <p className="mb-4 text-lg font-medium">Settings</p>
      <TabsNavStory />
    </div>
  )
}

/**
 * Same six Settings links at desktop width so padding can be compared
 * across short and long labels.
 */
export function TabsNavDesktopStory() {
  return (
    <div className="w-[1280px] max-w-full border border-border p-3">
      <p className="mb-4 text-lg font-medium">Settings</p>
      <TabsNavStory />
    </div>
  )
}
