import { useState } from "react"

import { SearchPicker } from "../src/search-picker.js"

type Place = { id: string; name: string }

/** The wards the search picker examples list, and how to read them. */
export const placeItems = {
  items: [
    { id: "north", name: "North ward" },
    { id: "east", name: "East ward" },
    { id: "south", name: "South ward" },
    { id: "west", name: "West ward" },
    { id: "central", name: "Central ward" },
  ] satisfies Place[],
  getValue: (item: Place) => item.id,
  getLabel: (item: Place) => item.name,
}

/** Always-visible combobox with a selected value. */
export function SearchPickerStory() {
  const [value, setValue] = useState("south")
  return (
    <SearchPicker
      className="max-w-sm"
      {...placeItems}
      value={value}
      onSelect={(item) => setValue(item.id)}
      label="Place"
      placeholder="Search places"
      emptyText="No places match"
    />
  )
}
