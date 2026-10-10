# Atlas React Kit

Shared React components and a Tailwind theme with square corners, semantic
colors, and distinct selected states. React 19 and Tailwind 4 are required.

```sh
npm install --save-exact atlas-react-kit@0.5.0
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

In your global stylesheet, import the theme after Tailwind and register the
installed JavaScript directory. Paths in `@source` are relative to that stylesheet;
this example assumes it is one directory below the project root.

```css
@import "tailwindcss";
@import "atlas-react-kit/theme.css";
@source "../node_modules/atlas-react-kit/dist";
```

The theme includes animations and shared light/dark tokens. Wrap the tree with
`ThemeProvider` from `atlas-react-kit/theme-provider`, or set the `dark` class
on an ancestor to activate dark colors. Supply your own font configuration;
`font-heading` uses the configured sans font. Application-specific tokens stay
with the application.

See [design rules](./DESIGN_RULES.md) for shared styling decisions and the
[component guide](./COMPONENTS.md) for exports and composition examples. Both
files ship in the npm package.

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
accessibility checks.

## Development and releases

```sh
npm ci
npm run check
npm test
npm pack
npm ci --prefix site
npm run build --prefix site
npm run preview --prefix site
```

`tsc` emits individual ESM files and TypeScript declarations. CSS is shipped
without compilation and processed by the consuming application's Tailwind build.
The public site is Storybook in `site/`. `npm run build --prefix site`
typechecks the stories, builds Storybook into `site/dist`, then checks the
static output. Vercel serves that directory; `/playground` and `/storybook`
redirect to `/`. The site and Storybook dependencies are not part of the npm
package. The optional Next.js 16 adapter requires Next only when imported. The
package does not bundle React.

Run `npm run dev --prefix site` (or `npm run storybook --prefix site`) for the
playground on port 6006. Existing examples live in `stories/` and are imported
by CSF story files in `site/stories/`, so component tests and previews share the
same examples. Add Storybook entries there when adding an example; the
static-output check reports any existing demo that has no Storybook entry.
Interactive stories use Storybook args so changing a control or interacting with
the component updates the same value. Configuration is in `site/.storybook/`.

The Storybook preview disables the kit's theme shortcut and uses the theme
toolbar instead. The accessibility panel checks the rendered story; it does not
replace keyboard or assistive-technology testing.

Bumping the version in `package.json` and merging to `main` (path-filtered
to package files) or running `workflow_dispatch` publishes through npm OIDC
trusted publishing after check, test, and pack gates. Versions already on npm
are skipped.

If trusted publishing is not configured, pack and publish a validated
artifact with the package owner's npm login:

```sh
mkdir -p release-artifacts
npm pack --pack-destination release-artifacts
npm publish ./release-artifacts/atlas-react-kit-0.5.0.tgz --access public
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for adding components, the browser
checks, versioning, and deprecations.

Pin an exact package version in consuming applications. Roll back an upgrade by
restoring the previous version and lockfile. License: MIT; upstream notices are
preserved in [NOTICE](./NOTICE).
