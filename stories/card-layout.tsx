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
