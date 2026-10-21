import { Meter } from "../src/meter.js"

/** Spend against a limit, the meter examples' main reading. */
export const spendMeter = {
  value: 72,
  max: 100,
  fillClassName: "bg-warning",
  "aria-label": "Spend against limit",
}

/** Ticks on the value scale: a limit warning and the typical spend. */
export const spendMarkers = [
  { position: 80 },
  { position: 50, className: "w-0.5 bg-foreground" },
]

/** Track, fill, and ticks on the value scale — not a Progress bar. */
export function MeterStory() {
  return (
    <div className="grid max-w-sm gap-3">
      <Meter {...spendMeter} markers={spendMarkers} />
      <Meter value={30} max={150} aria-label="Pace versus typical" />
    </div>
  )
}
