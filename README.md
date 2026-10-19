# Atlas React Kit

Shared React components and a Tailwind theme with square corners, semantic
colors, and distinct selected states. From 1.0 the API is stable: breaking
changes to stable components only ship in a major release (see
[CONTRIBUTING.md](./CONTRIBUTING.md#versions-and-releases)).
React 19, Tailwind 4, and Node >=20.19 are required. Next 16 is needed only
when using `next/nav-link`, `next/period-stepper`, or `next/tabs-nav-link`.

```sh
npm install --save-exact atlas-react-kit@1.1.0
```

Import components by subpath:

```tsx
import { Button } from "atlas-react-kit/button"
import { Card, CardContent } from "atlas-react-kit/card"

export function Example() {
  return (
    <Card>
      <CardContent>
        <Button>Save</Button>
      </CardContent>
    </Card>
  )
}
```

Core entries need only the kit. Feature entries may need optional peers; see
the [component guide's install table](./COMPONENTS.md#optional-peer-dependencies).

In your global stylesheet, import the theme after Tailwind and register the
installed JavaScript directory. Paths in `@source` are relative to that stylesheet;
this example assumes it is one directory below the project root.

```css
@import "tailwindcss";
@import "atlas-react-kit/theme.css";
@source "../node_modules/atlas-react-kit/dist";
```

The theme includes animations and shared light/dark tokens. Wrap the tree with
`ThemeProvider` from `atlas-react-kit/theme-provider` (install
`next-themes@^0.4.6` first), or set the `dark` class on an ancestor to activate
dark colors. Supply your own font configuration;
`font-heading` uses the configured sans font. Application-specific tokens stay
with the application.

## Documentation

- [Component guide](./COMPONENTS.md): imports, props, optional installs, and
  composition. This guide ships in the npm package.
- [Design rules](./DESIGN_RULES.md): tokens, accessibility, writing, and
  composition. This guide ships in the npm package.
- [Contributing](./CONTRIBUTING.md): component changes, checks, and releases.
- [Decisions behind 1.0 (record)](./ROADMAP-1.0.md): the closed roadmap that
  led to 1.0.0.
- [Changelog](./CHANGELOG.md): published and upcoming changes.

## AI coding assistants

The package also ships an agent skill,
[`skills/atlas-react-kit/SKILL.md`](./skills/atlas-react-kit/SKILL.md). It
tells an assistant to read the guides for the installed version, pick kit
components over hand-rolled markup, style with tokens, and check its work. Link
it into Claude Code from the app root, so it updates with the package:

```sh
mkdir -p .claude/skills
ln -s ../../node_modules/atlas-react-kit/skills/atlas-react-kit .claude/skills/atlas-react-kit
```

On Windows, or to commit a pinned copy, use
`cp -r node_modules/atlas-react-kit/skills/atlas-react-kit .claude/skills/`
instead. For Cursor, Codex, or other agents, point your `AGENTS.md` at
`node_modules/atlas-react-kit/skills/atlas-react-kit/SKILL.md`. Shared component changes belong in this repository;
applications compose their feature UI around the package and upgrade deliberately.

Public docs and a live playground are at
[design.querobines.com](https://design.querobines.com). The site is Storybook:
tokens parsed from `theme.css`, these markdown guides rendered from source, and
editable component stories with light/dark themes, viewport previews, and
accessibility checks. Its build publishes `docs-index.json` with guide headings
and package entry points for search and indexing tools.

## Development and releases

Setup, checks, the component checklist, and releases are in
[CONTRIBUTING.md](./CONTRIBUTING.md).

Pin an exact package version in consuming applications. Roll back an upgrade by
restoring the previous version and lockfile. License: MIT; upstream notices are
preserved in [NOTICE](./NOTICE).
