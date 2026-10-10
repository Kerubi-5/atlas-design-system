import { Checkbox } from "../src/checkbox.js"
import { Label } from "../src/label.js"
import { Toggle } from "../src/toggle.js"
import { ToggleGroup, ToggleGroupItem } from "../src/toggle-group.js"

/** Checkbox with the kit label (sentence case beside a control). */
export function CheckboxStory() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="notify" defaultChecked />
      <Label htmlFor="notify">Email me when the export is ready</Label>
    </div>
  )
}

/** Outline and selected toggle states. */
export function ToggleStory() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle aria-label="Bold">Bold</Toggle>
      <Toggle variant="outline" defaultPressed aria-label="Italic">
        Italic
      </Toggle>
    </div>
  )
}

/** Single- and multi-select groups using the selected wash and border. */
export function ToggleGroupStory() {
  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup type="single" variant="outline" defaultValue="list">
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="board">Board</ToggleGroupItem>
        <ToggleGroupItem value="chart">Chart</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="multiple" variant="outline" defaultValue={["bold"]}>
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
