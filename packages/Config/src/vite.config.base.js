import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'

export const Aliases = {
    // Auth
    '~demo': fileURLToPath(new URL('../../../apps/src', import.meta.url)),

    '~typical/core': fileURLToPath(new URL('../../Core/src', import.meta.url)),
    '~typical/elements': fileURLToPath(new URL('../../Elements/src', import.meta.url)),
    '~typical/editor': fileURLToPath(new URL('../../Editor/src', import.meta.url)),
    '~typical/text': fileURLToPath(new URL('../../Text/src', import.meta.url)),
    '~typical/text-nodes': fileURLToPath(new URL('../../Nodes/src', import.meta.url)),
    '~typical/tests': fileURLToPath(new URL('../../__tests__/src', import.meta.url)),
}

// https://vitejs.dev/config/
export const ViteConfigBase = defineConfig({
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      ...Aliases
    }
  }
})
