import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"
import { fn } from "storybook/test"

import { SearchPicker } from "../../src/search-picker.js"
import { placeItems, SearchPickerStory } from "../../stories/search-picker.js"

const meta = {
  title: "Forms/Search picker",
  args: {
    value: "south",
    label: "Place",
    placeholder: "Search places",
    emptyText: "No places match",
    disabled: false,
    onSelect: fn(),
  },
  argTypes: {
    value: {
      control: "select",
      options: placeItems.items.map(placeItems.getValue),
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    emptyText: { control: "text" },
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <SearchPicker
        className="max-w-sm"
        {...placeItems}
        value={args.value}
        label={args.label}
        placeholder={args.placeholder}
        emptyText={args.emptyText}
        disabled={args.disabled}
        onSelect={(item) => {
          args.onSelect(item)
          updateArgs({ value: item.id })
        }}
      />
    )
  },
} satisfies Meta<{
  value: string
  label: string
  placeholder: string
  emptyText: string
  disabled: boolean
  onSelect: (item: { id: string; name: string }) => void
}>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Example: Story = {
  render: () => <SearchPickerStory />,
  parameters: { controls: { disable: true } },
}
