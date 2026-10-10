import { useState } from "react"

import { SearchPicker } from "../src/search-picker.js"

const places = [
  { id: "north", name: "North ward" },
  { id: "east", name: "East ward" },
  { id: "south", name: "South ward" },
  { id: "west", name: "West ward" },
  { id: "central", name: "Central ward" },
]

/** Always-visible combobox with a selected value. */
export function SearchPickerStory() {
  const [value, setValue] = useState("south")
  return (
    <SearchPicker
      className="max-w-sm"
      items={places}
      getValue={(item) => item.id}
      getLabel={(item) => item.name}
      value={value}
      onSelect={(item) => setValue(item.id)}
      label="Place"
      placeholder="Search places"
      emptyText="No places match"
    />
  )
}
