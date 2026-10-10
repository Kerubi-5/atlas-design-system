// Minimal static server for the built Storybook site (site/dist). Used by
// the accessibility and screenshot tests; run directly to serve on a port:
// `node tests/serve.mjs 4400`.
import fs from "node:fs/promises"
import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"

const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
}

export const distDir = fileURLToPath(new URL("../dist", import.meta.url))

/** Serve `root` on 127.0.0.1; port 0 picks a free one. */
export function serve(root = distDir, port = 0) {
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost")
    let file = path.join(root, decodeURIComponent(url.pathname))
    if (!file.startsWith(root)) {
      response.writeHead(403).end()
      return
    }
    if (url.pathname.endsWith("/")) file = path.join(file, "index.html")
    try {
      const body = await fs.readFile(file)
      response.writeHead(200, {
        "content-type":
          contentTypes[path.extname(file)] ?? "application/octet-stream",
      })
      response.end(body)
    } catch {
      response.writeHead(404).end()
    }
  })
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server))
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] ?? 4400)
  await serve(distDir, port)
  console.log(`Serving ${distDir} on http://127.0.0.1:${port}`)
}
