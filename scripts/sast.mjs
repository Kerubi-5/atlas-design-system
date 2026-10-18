// Runs Semgrep with the repository's own rules (.semgrep.yml) on src/.
// Semgrep is a Python tool, not an npm package, so say how to get it
// instead of skipping: a missing scanner must not pass the gate.
import { spawnSync } from "node:child_process"

const args = [
  "scan",
  "--config",
  ".semgrep.yml",
  "--metrics=off",
  "--disable-version-check",
  "--error",
  "--quiet",
  "src",
]
const result = spawnSync("semgrep", args, { stdio: "inherit" })

if (result.error?.code === "ENOENT") {
  console.error(
    "Semgrep is not installed. Install it, then push again:\n" +
      "  macOS: brew install semgrep\n" +
      "  elsewhere: pipx install semgrep (or python3 -m pip install semgrep)"
  )
  process.exit(1)
}
process.exit(result.status ?? 1)
