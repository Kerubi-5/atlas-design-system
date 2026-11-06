import { Card, CardContent, CardHeader, CardTitle } from "../src/card.js"

/** Profile-style cards in a bounded flex column must keep their body height. */
export function FlexColumnCardsStory() {
  return (
    <div className="flex h-64 flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>Body that must not collapse to a title strip.</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Second</CardTitle>
        </CardHeader>
        <CardContent>Another full card in the same column.</CardContent>
      </Card>
    </div>
  )
}

/** Header stays padded while the body can go edge to edge with `px-0`. */
export function CardContentPx0Story() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export</CardTitle>
      </CardHeader>
      <CardContent className="px-0">Full-bleed body</CardContent>
    </Card>
  )
}

/**
 * Flush calendar-style hour label on the bottom edge. The card must not
 * clip it; a direct banner image still clips when the app rounds the card.
 */
export function FlushEdgeLabelStory() {
  return (
    <div className="flex flex-col gap-6">
      <Card flush className="w-64">
        <div className="relative h-32">
          <span
            data-slot="calendar-hour-label"
            className="absolute bottom-0 left-0 text-xs leading-none"
          >
            11 PM
          </span>
        </div>
      </Card>
      <Card flush className="w-64 rounded-lg">
        <img
          alt=""
          className="h-16 w-full bg-muted"
          height={64}
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          width={256}
        />
      </Card>
    </div>
  )
}
