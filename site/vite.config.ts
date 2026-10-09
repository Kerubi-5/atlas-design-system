import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const siteRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(siteRoot, "..")

/**
 * Prefer the kit install at the repo root so Vite and the source tree share
 * one React copy. Fall back to this package when the site is installed alone.
 */
function moduleDir(name: string) {
  const fromRoot = path.join(repoRoot, "node_modules", name)
  if (fs.existsSync(fromRoot)) return fromRoot
  return path.join(siteRoot, "node_modules", name)
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      react: moduleDir("react"),
      "react-dom": moduleDir("react-dom"),
      "react/jsx-runtime": path.join(moduleDir("react"), "jsx-runtime"),
      "react/jsx-dev-runtime": path.join(moduleDir("react"), "jsx-dev-runtime"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: { allow: [repoRoot] },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
})
