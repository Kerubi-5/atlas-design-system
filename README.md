# Atlas React Kit

Shared React components and a Tailwind theme with square corners, semantic
colors, and distinct selected states. React 19 and Tailwind 4 are required.

```sh
npm install --save-exact atlas-react-kit@0.1.0
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

The theme includes animations and shared light/dark tokens. Set the `dark` class
on an ancestor to activate dark colors. Supply your own font configuration;
`font-heading` uses the configured sans font. Application-specific tokens stay
with the application.

See [design rules](./DESIGN_RULES.md) for shared styling decisions and the
[component guide](./COMPONENTS.md) for exports and composition examples. Both
files ship in the npm package. Shared component changes belong in this repository;
applications compose their feature UI around the package and upgrade deliberately.

## Development and releases

```sh
npm ci
npm run check
npm test
npm pack
```

`tsc` emits individual ESM files and TypeScript declarations. CSS is shipped
without compilation and processed by the consuming application's Tailwind build.
The optional Next.js 16 adapter requires Next only when imported. The package
does not bundle React.

For the first release, create and validate a packed artifact:

```sh
mkdir -p release-artifacts
npm pack --pack-destination release-artifacts
```

Install that tarball in consumer fixtures and complete their checks. The package
owner then publishes that exact validated artifact, without rebuilding it:

```sh
npm publish ./release-artifacts/atlas-react-kit-0.1.0.tgz --access public
```

The owner then configures npm trusted publishing for this repository's
`release.yml` workflow on a GitHub-hosted runner.
Later releases use explicit `v<version>` tags matching `package.json`; CI runs
checks before publishing through npm OIDC. Pushing to `main` runs validation only.
Do not push a release tag for the initial manual publication.

Pin an exact package version in consuming applications. Roll back an upgrade by
restoring the previous version and lockfile. License: MIT; upstream notices are
preserved in [NOTICE](./NOTICE).
