import { svelteTesting } from "@testing-library/svelte/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit(), svelteTesting()],
  server: {
    host: "0.0.0.0",
    port: 3001,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 3001,
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.{spec,test}.{js,ts}", "tests/**/*.{spec,test}.{js,ts}"],
  },
});
