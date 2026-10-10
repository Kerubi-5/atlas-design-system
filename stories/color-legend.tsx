import { ColorLegend } from "../src/color-legend.js"

/** Generic color scale. Overlay chrome is a className, not built in. */
export function ColorLegendStory() {
  return (
    <ColorLegend
      className="max-w-xs border border-border bg-card p-3"
      title="Depth"
      aria-label="Depth scale"
      caption="Heights in metres"
      items={[
        { color: "#1d4ed8", range: "2+", label: "Deep" },
        { color: "#3b82f6", range: "1–2", label: "Moderate" },
        { color: "#93c5fd", range: "0–1", label: "Shallow" },
      ]}
    />
  )
}
