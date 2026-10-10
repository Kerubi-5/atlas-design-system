import { Meter } from "../src/meter.js"
import { StatTile, statTileGrid } from "../src/stat-tile.js"

/** Two tiles in the shared grid, one with a meter. */
export function StatTileStory() {
  return (
    <div className={`${statTileGrid} max-w-lg sm:grid-cols-2`}>
      <StatTile label="Spent" value="1,240" sub="of 2,000 this month">
        <Meter
          value={1240}
          max={2000}
          markers={[{ position: 1600 }]}
          aria-label="Spent of monthly limit"
        />
      </StatTile>
      <StatTile label="Remaining" value="760" sub="12 days left" />
    </div>
  )
}
