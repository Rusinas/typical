import { mergeConfig } from 'vite'
import { ViteConfigBase } from '@typical/config'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default mergeConfig(
  ViteConfigBase,
  {
    plugins: [vue()],
  }
)
