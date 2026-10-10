import { Badge } from "../src/badge.js"
import { InfoTip, InlineTip } from "../src/info-tip.js"

/** Box layout next to a heading, and inline in a sentence. */
export function InfoTipStory() {
  return (
    <div className="grid max-w-lg gap-4">
      <div className="flex items-center gap-1">
        <h2 className="font-heading text-sm font-semibold tracking-widest uppercase">
          Depth
        </h2>
        <InfoTip
          label="About depth"
          title="Depth"
          description="Height of standing water at this point."
          badge={
            <Badge variant="soft" tone="neutral">
              Scale
            </Badge>
          }
        >
          Values come from the map layer the app owns.
        </InfoTip>
      </div>
      <p className="text-sm">
        The layer uses a relative scale
        <InlineTip
          label="About the relative scale"
          title="Relative scale"
          description="Bins are comparable within this map, not across years."
        />{" "}
        so neighbouring areas can be compared.
      </p>
    </div>
  )
}
