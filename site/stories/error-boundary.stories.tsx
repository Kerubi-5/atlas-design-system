import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../../src/button.js"
import { ErrorBoundary } from "../../src/error-boundary.js"
import { ErrorFallbackStory } from "../../stories/display.js"

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Storybook recovery demo")
  }
  return (
    <p className="text-sm text-muted-foreground">Rendered without error.</p>
  )
}

const meta = {
  title: "Feedback/Error boundary",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Generic recovery chrome. The fallback can be rendered on its own; the boundary catches a throw and offers retry.",
      },
    },
  },
} satisfies Meta<typeof ErrorBoundary>
export default meta
type Story = StoryObj<typeof meta>

export const Fallback: Story = {
  render: () => <ErrorFallbackStory />,
}

export const Catch: Story = {
  render: function Render() {
    const [epoch, setEpoch] = useState(0)
    const [shouldThrow, setShouldThrow] = useState(false)
    return (
      <div className="grid max-w-md gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setShouldThrow(false)
            setEpoch((value) => value + 1)
          }}
        >
          Reset story
        </Button>
        <ErrorBoundary key={epoch} message="Could not load this panel.">
          <div className="grid gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShouldThrow(true)}
            >
              Throw
            </Button>
            <Boom shouldThrow={shouldThrow} />
          </div>
        </ErrorBoundary>
      </div>
    )
  },
}
