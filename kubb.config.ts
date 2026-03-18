import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginClient } from "@kubb/plugin-client";
import { pluginSwr } from "@kubb/plugin-swr";
import { pluginZod } from "@kubb/plugin-zod";

export default defineConfig({
  root: ".",
  input: {
    path: "./apps/ash_framework/priv/specs/openapi.yaml",
  },
  output: {
    path: "./packages/shared/src/api",
    clean: true,
    extension: {
      ".ts": "",
    },
  },
  plugins: [
    pluginOas({
      validate: false,
    }),
    pluginTs({
      output: {
        path: "models",
      },
      enumType: "asConst",
      dateType: "string",
    }),
    pluginClient({
      output: {
        path: "clients",
      },
      dataReturnType: "data",
      pathParamsType: "inline",
      importPath: "../../lib/client",
    }),
    pluginSwr({
      output: {
        path: "hooks/swr",
        barrelType: false,
      },
      client: {
        dataReturnType: "data",
        importPath: "../../../lib/client",
      },
      query: {
        methods: ["get"],
        importPath: "swr",
      },
      mutation: {
        methods: ["post", "patch", "delete"],
        importPath: "swr/mutation",
      },
      pathParamsType: "inline",
      parser: "client",
    }),
    pluginZod({
      output: {
        path: "zod",
      },
      dateType: "string",
      typed: true,
      version: "4",
    }),
  ],
});
