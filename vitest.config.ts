import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["app/lib/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["app/lib/**/*.ts"],
      exclude: ["app/lib/**/*.test.ts", "app/lib/classnames.ts"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
    },
  },
});
