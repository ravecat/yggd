//@ts-check

const path = require("path");
const { composePlugins, withNx } = require("@nx/next");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  // nx: {},
  cacheComponents: true,

  // Standalone mode for minimal production Docker images
  output: "standalone",

  outputFileTracingRoot: path.join(__dirname, "../../"),
};

/** @type {(import("@nx/next/src/utils/config").NextPlugin | import("@nx/next/src/utils/config").NextPluginThatReturnsConfigFn)[]} */
const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
