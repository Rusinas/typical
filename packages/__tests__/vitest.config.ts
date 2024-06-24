/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite'
import { ViteConfigBase } from '../../Config/src/vite.config.base'
import vue from '@vitejs/plugin-vue'
import VueTypeImports from 'vite-plugin-vue-type-imports'

export default defineConfig(mergeConfig(
  ViteConfigBase,
  {
    plugins: [
      vue()
    ],
    test: {
      reporters: ['verbose']
    },
  }
))
