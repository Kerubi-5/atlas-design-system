// Temporary: describe where a failed screenshot differs from its baseline.
// Usage: node tests/visual/describe-diff.cjs <expected.png> <actual.png>
const fs = require("node:fs")
const { PNG } = require("playwright-core/lib/utilsBundle")

const [expected, actual] = process.argv
  .slice(2)
  .map((file) => PNG.sync.read(fs.readFileSync(file)))
console.log(
  `expected ${expected.width}x${expected.height}, actual ${actual.width}x${actual.height}`
)
const width = Math.min(expected.width, actual.width)
const height = Math.min(expected.height, actual.height)
const CELL = 6
const cols = Math.ceil(width / CELL)
const grid = Array.from({ length: Math.ceil(height / CELL) }, () =>
  new Array(cols).fill(0)
)
const samples = []
let count = 0
let box = [width, height, 0, 0]
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const e = (y * expected.width + x) * 4
    const a = (y * actual.width + x) * 4
    const delta = Math.max(
      ...[0, 1, 2, 3].map((c) =>
        Math.abs(expected.data[e + c] - actual.data[a + c])
      )
    )
    if (delta > 40) {
      count++
      grid[Math.floor(y / CELL)][Math.floor(x / CELL)]++
      box = [
        Math.min(box[0], x),
        Math.min(box[1], y),
        Math.max(box[2], x),
        Math.max(box[3], y),
      ]
      if (count % 150 === 1) {
        const rgb = (d, i) => `${d[i]},${d[i + 1]},${d[i + 2]},${d[i + 3]}`
        samples.push(
          `(${x},${y}) expected ${rgb(expected.data, e)} actual ${rgb(actual.data, a)}`
        )
      }
    }
  }
}
console.log(`${count} pixels differ by more than 40; box ${box.join(",")}`)
console.log(
  `map (one char per ${CELL}x${CELL} cell; . none, 1-9 count, # 10+):`
)
for (const row of grid) {
  console.log(
    row.map((n) => (n === 0 ? "." : n < 10 ? String(n) : "#")).join("")
  )
}
console.log(samples.join("\n"))
