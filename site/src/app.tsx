import { ThemeProvider } from "../../src/theme-provider.js"
import { Toaster } from "../../src/sonner.js"

import { Shell } from "./components/shell.js"
import { getDocPage } from "./lib/docs.js"
import { usePathname } from "./lib/router.js"
import { DocsPage } from "./pages/docs.js"
import { HomePage } from "./pages/home.js"
import { NotFoundPage } from "./pages/not-found.js"
import { PlaygroundPage } from "./pages/playground.js"
import { TokensPage } from "./pages/tokens.js"

function Route({ pathname }: { pathname: string }) {
  if (pathname === "/") return <HomePage />
  if (pathname === "/playground") return <PlaygroundPage />
  if (pathname === "/tokens") return <TokensPage />
  if (pathname === "/docs" || pathname === "/docs/") {
    return <DocsPage slug="readme" />
  }
  const docsMatch = /^\/docs\/([^/]+)$/.exec(pathname)
  if (docsMatch?.[1]) {
    if (!getDocPage(docsMatch[1])) return <NotFoundPage />
    return <DocsPage slug={docsMatch[1]} />
  }
  return <NotFoundPage />
}

export function App() {
  const pathname = usePathname()

  return (
    <ThemeProvider storageKey="atlas-docs-theme">
      <Shell pathname={pathname}>
        <Route pathname={pathname} />
      </Shell>
      <Toaster />
    </ThemeProvider>
  )
}
