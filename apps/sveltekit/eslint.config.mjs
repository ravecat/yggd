import svelte from "eslint-plugin-svelte";
import globals from "globals";
import tseslint from "typescript-eslint";
import svelteConfig from "./svelte.config.js";
import baseConfig from "../../eslint.config.mjs";

export default tseslint.config(
  ...baseConfig,
  ...svelte.configs.recommended,
  {
    ignores: ["build/**/*", ".svelte-kit/**/*"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: tseslint.parser,
        svelteConfig,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/shared/ui/button/button.svelte"],
    rules: {
      "svelte/no-navigation-without-resolve": "off",
    },
  },
);
