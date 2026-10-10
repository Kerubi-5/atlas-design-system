import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.{ts,tsx}"],
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      reporter: ["text-summary", "text"],
      // Floors just under the current numbers (95% lines, 87% branches):
      // CI fails when new code lands without tests.
      thresholds: { lines: 94, statements: 92, functions: 93, branches: 85 },
    },
  },
})
