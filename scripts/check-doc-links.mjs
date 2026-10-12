import { readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import remarkParse from "remark-parse"
import { unified } from "unified"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const errors = []
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".next",
])

async function markdownFiles(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await markdownFiles(path.join(directory, entry.name))))
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(path.join(directory, entry.name))
    }
  }

  return files.sort()
}

function textContent(node) {
  if (node.type === "text" || node.type === "inlineCode") return node.value
  return node.children?.map(textContent).join("") ?? ""
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
}

function parseDocument(file, source) {
  const tree = unified().use(remarkParse).parse(source)
  const headings = []
  const anchors = new Set()
  const links = []
  const slugCounts = new Map()

  function visit(node) {
    if (node.type === "heading") {
      const title = textContent(node).trim()
      const base = slugify(title)
      const count = slugCounts.get(base) ?? 0
      slugCounts.set(base, count + 1)
      const anchor = count === 0 ? base : `${base}-${count}`
      anchors.add(anchor)
      headings.push({ level: node.depth, title, anchor })
    }

    if (node.type === "link" || node.type === "image") {
      links.push({ url: node.url, line: node.position?.start.line ?? 1 })
      if (
        node.type === "link" &&
        /^(?:here|click here|read more|more)$/i.test(textContent(node).trim())
      ) {
        errors.push(
          `${file}:${node.position?.start.line ?? 1}: use descriptive link text`
        )
      }
    }

    if (node.type === "html") {
      for (const match of node.value.matchAll(/\bid=["']([^"']+)["']/g)) {
        anchors.add(match[1])
      }
    }

    for (const child of node.children ?? []) visit(child)
  }

  visit(tree)
  return {
    title:
      headings.find(({ level }) => level === 1)?.title ?? path.basename(file),
    headings,
    anchors,
    links,
  }
}

const files = await markdownFiles()
const documents = new Map()
for (const file of files) {
  const relativePath = path.relative(root, file).split(path.sep).join("/")
  const source = await readFile(file, "utf8")
  documents.set(relativePath, parseDocument(relativePath, source))
}

let checkedLinks = 0
for (const [sourcePath, document] of documents) {
  for (const { url, line } of document.links) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/)/i.test(url)) continue

    const [target, rawAnchor] = url.split("#", 2)
    const targetPath = target.split("?", 1)[0]
    let resolved = sourcePath
    if (targetPath) {
      try {
        resolved = decodeURIComponent(
          path.relative(
            root,
            path.resolve(root, path.dirname(sourcePath), targetPath)
          )
        )
          .split(path.sep)
          .join("/")
      } catch {
        errors.push(`${sourcePath}:${line}: invalid link target ${url}`)
        continue
      }
    }

    const absoluteTarget = path.resolve(root, resolved)
    if (
      !absoluteTarget.startsWith(`${root}${path.sep}`) &&
      absoluteTarget !== root
    ) {
      errors.push(`${sourcePath}:${line}: link escapes the repository: ${url}`)
      continue
    }

    try {
      const targetStat = await stat(absoluteTarget)
      if (!targetStat.isFile()) {
        errors.push(`${sourcePath}:${line}: link target is not a file: ${url}`)
        continue
      }
    } catch {
      errors.push(`${sourcePath}:${line}: missing link target ${url}`)
      continue
    }

    checkedLinks += 1
    if (rawAnchor) {
      const targetDoc = documents.get(resolved)
      if (targetDoc && !targetDoc.anchors.has(decodeURIComponent(rawAnchor))) {
        errors.push(`${sourcePath}:${line}: missing heading anchor ${url}`)
      }
    }
  }
}

if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`)
  process.exitCode = 1
} else {
  const manifest = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8")
  )
  const index = {
    schemaVersion: 1,
    package: { name: manifest.name, version: manifest.version },
    components: Object.keys(manifest.exports)
      .filter((entry) => typeof manifest.exports[entry] === "object")
      .map((entry) => entry.slice(2)),
    documents: [...documents].map(([file, document]) => ({
      path: file,
      title: document.title,
      headings: document.headings,
      links: document.links
        .map(({ url }) => url)
        .filter((url) => !/^(?:[a-z][a-z\d+.-]*:|\/\/|\/)/i.test(url)),
    })),
  }
  const output = path.join(root, "site/public/docs-index.json")
  await mkdir(path.dirname(output), { recursive: true })
  await writeFile(output, `${JSON.stringify(index, null, 2)}\n`)
  console.log(
    `Checked ${documents.size} Markdown files and ${checkedLinks} local links; indexed ${index.components.length} package entries.`
  )
}
