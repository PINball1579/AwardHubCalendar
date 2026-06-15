import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["tests/setup.ts"],
    coverage: { provider: "v8", reporter: ["text", "html"] },
    exclude: ["tests/e2e/**", "node_modules/**"],
    // Integration tests share a single Postgres test DB and clean up shared
    // rows (e.g. sourceEventId "SRC1") in beforeEach; running test files in
    // parallel causes cross-file race conditions on deleteMany/cascades.
    fileParallelism: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
