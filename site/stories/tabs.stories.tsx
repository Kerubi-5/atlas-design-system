import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../src/tabs.js"
import { TabsNavStory, TabsStory } from "../../stories/navigation.js"

type Args = { value: string }
const meta = {
  title: "Components/Tabs",
  args: { value: "overview" },
  argTypes: {
    value: { control: "select", options: ["overview", "activity"] },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <Tabs
        value={args.value}
        onValueChange={(value) => updateArgs({ value })}
        className="max-w-md"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-sm text-muted-foreground">Overview panel</p>
        </TabsContent>
        <TabsContent value="activity">
          <p className="text-sm text-muted-foreground">Activity panel</p>
        </TabsContent>
      </Tabs>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Composition: Story = {
  render: () => <TabsStory />,
  parameters: { controls: { disable: true } },
}
export const Nav: Story = {
  render: () => <TabsNavStory />,
  parameters: { controls: { disable: true } },
}
