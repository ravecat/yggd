import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import nx from "@nx/eslint-plugin";
import baseConfig from "../../eslint.config.mjs";

const config = [
  ...nextConfig,
  ...coreWebVitals,
  ...baseConfig,
  ...nx.configs["flat/react-typescript"],
  {
    ignores: [".next/**/*", "**/out-tsc"],
  },
];

export default config;
