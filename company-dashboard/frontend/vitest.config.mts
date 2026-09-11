import { defineConfig } from "vitest/config";

export default defineConfig({
  // "server-only" (imported by lib/db.ts et al.) only no-ops under the
  // "react-server" condition — Next's bundler sets it implicitly. Vitest
  // resolves test files through its SSR module graph, so the condition has
  // to be added there (ssr.resolve), not the client-facing resolve.conditions.
  ssr: {
    resolve: {
      conditions: ["react-server"],
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
