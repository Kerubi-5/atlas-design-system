import type { Meta, StoryObj } from "@storybook/react-vite"

import { NavLink, isNavActive } from "../../src/nav-link.js"
import {
  NavLinkAsChildStory,
  NavLinkShellStory,
} from "../../stories/nav-link.js"

type Args = { children: string; href: string; pathname: string }

const meta = {
  title: "Navigation/Nav link",
  args: { children: "Calendar", href: "/calendar", pathname: "/calendar/week" },
  argTypes: {
    children: { control: "text" },
    href: { control: "text" },
    pathname: {
      control: "text",
      description:
        "The current URL path; `isNavActive(pathname, href)` marks the link active on the path or a page under it",
    },
  },
  render: (args) => (
    <nav aria-label="App" className="flex items-center gap-1">
      <NavLink
        href={args.href}
        active={isNavActive(args.pathname, args.href)}
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
