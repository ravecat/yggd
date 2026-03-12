import adapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      precompress: true,
    }),
    alias: {
      $shared: "./src/shared",
    },
  },
};

export default config;
