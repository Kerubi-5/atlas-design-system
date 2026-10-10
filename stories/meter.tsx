import { Meter } from "../src/meter.js"

/** Track, fill, and ticks on the value scale — not a Progress bar. */
export function MeterStory() {
  return (
    <div className="grid max-w-sm gap-3">
      <Meter
        value={72}
        max={100}
        fillClassName="bg-warning"
        markers={[
          { position: 80 },
          { position: 50, className: "w-0.5 bg-foreground" },
        ]}
        aria-label="Spend against limit"
      />
      <Meter value={30} max={150} aria-label="Pace versus typical" />
    </div>
  )
}
