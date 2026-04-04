import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/lib/**", "src/hooks/**", "src/components/**"],
      exclude: [
        "src/lib/types.ts",
        "src/lib/locale.ts",
        "src/**/*.d.ts",
        "src/**/__tests__/**",
        "src/**/*.stories.tsx",
        "src/test/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
