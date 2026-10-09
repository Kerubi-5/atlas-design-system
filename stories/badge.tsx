import { Badge } from "../src/badge.js"

/** Default, muted, and soft status chips. */
export function BadgeVariantsStory() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
      <Badge variant="soft" tone="neutral">
        Neutral
      </Badge>
      <Badge variant="soft" tone="success">
        Paid
      </Badge>
      <Badge variant="soft" tone="warning">
        Due
      </Badge>
      <Badge variant="soft" tone="destructive">
        Failed
      </Badge>
    </div>
  )
}
