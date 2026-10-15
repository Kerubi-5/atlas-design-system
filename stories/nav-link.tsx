import { NavLink } from "../src/nav-link.js"

/** KairOS-style app shell labels. */
export const SHELL_LINKS = ["Calendar", "Tasks", "Settings"] as const

type ShellLink = (typeof SHELL_LINKS)[number]

function slug(label: string) {
  return label.toLowerCase()
}

/**
 * Pill links in a labelled nav. The active item uses aria-current; the
 * kit does not read the route.
 */
export function NavLinkShellStory({
  active = "Calendar",
}: { active?: ShellLink } = {}) {
  return (
    <nav aria-label="App" className="flex items-center gap-1">
      {SHELL_LINKS.map((label) => {
        const isActive = label === active
        return (
          <NavLink
            key={label}
            href={`#${slug(label)}`}
            active={isActive}
            onClick={(event) => event.preventDefault()}
          >
            {label}
          </NavLink>
        )
      })}
    </nav>
  )
}

/**
 * Same pills with `asChild`, the pattern apps use to wrap a router Link.
 */
export function NavLinkAsChildStory({
  active = "Calendar",
}: { active?: ShellLink } = {}) {
  return (
    <nav aria-label="App" className="flex items-center gap-1">
      {SHELL_LINKS.map((label) => {
        const isActive = label === active
        return (
          <NavLink key={label} asChild active={isActive}>
            <a
              href={`#${slug(label)}`}
              onClick={(event) => event.preventDefault()}
            >
              {label}
            </a>
          </NavLink>
        )
      })}
    </nav>
  )
}
