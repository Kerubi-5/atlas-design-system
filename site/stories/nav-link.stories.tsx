import type { Meta, StoryObj } from "@storybook/react-vite"

import { NavLink } from "../../src/nav-link.js"
import {
  NavLinkAsChildStory,
  NavLinkShellStory,
} from "../../stories/nav-link.js"

type Args = { children: string; active: boolean; href: string }

const meta = {
  title: "Navigation/Nav link",
  args: { children: "Calendar", active: false, href: "#calendar" },
  argTypes: {
    children: { control: "text" },
    active: { control: "boolean" },
    href: { control: "text" },
  },
  render: (args) => (
    <nav aria-label="App" className="flex items-center gap-1">
      <NavLink
        href={args.href}
        active={args.active}
        onClick={(event) => event.preventDefault()}
      >
        {args.children}
      </NavLink>
    </nav>
  ),
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Shell: Story = {
  render: () => <NavLinkShellStory />,
  parameters: { controls: { disable: true } },
}
export const AsChild: Story = {
  render: () => <NavLinkAsChildStory />,
  parameters: { controls: { disable: true } },
}
