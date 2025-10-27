import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginClient } from '@kubb/plugin-client'
// import { pluginZod } from '@kubb/plugin-zod'

export default defineConfig({
  root: '.',
  input: {
    path: './openapi.json',
  },
  output: {
    path: './packages/shared/src/api/generated',
    clean: true,
    extension: {
      '.ts': '.js',
    },
  },
  plugins: [
    pluginOas({
      validate: false,
    }),
    pluginTs({
      output: {
        path: 'models',
      },
      enumType: 'asConst',
      dateType: 'string',
    }),
    pluginClient({
      output: {
        path: 'clients',
      },
      dataReturnType: 'data',
      pathParamsType: 'inline',
      importPath: '../../client.js',
    }),
    // Temporarily disabled due to kubb bugs with zod v4
    // pluginZod({
    //   output: {
    //     path: 'zod',
    //   },
    //   dateType: 'string',
    // }),
  ],
})
