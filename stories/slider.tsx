import { useState } from "react"

import { Label } from "../src/label.js"
import { Slider } from "../src/slider.js"

/** Labelled slider with a live value. */
export function SliderStory() {
  const [value, setValue] = useState(40)
  return (
    <div className="grid max-w-sm gap-2">
      <div className="flex items-center justify-between">
        <Label id="chance-label">Chance</Label>
        <span className="text-sm text-muted-foreground tabular-nums">
          {value}%
        </span>
      </div>
      <Slider
        id="chance"
        aria-labelledby="chance-label"
        value={value}
        onValueChange={setValue}
      />
    </div>
  )
}
