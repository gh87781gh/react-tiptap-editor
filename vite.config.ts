import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  if (isLib) {
    // 組件庫建置模式
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src')
        }
      },
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'TiptapEditor',
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
        },
        rollupOptions: {
          // 確保將 peer dependencies 排除在 bundle 之外
          external: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-image',
            '@tiptap/extension-list',
            '@tiptap/extension-text-align',
            '@tiptap/extension-typography',
            '@tiptap/extension-highlight',
            '@tiptap/extension-subscript',
            '@tiptap/extension-superscript',
            '@tiptap/extension-horizontal-rule',
            '@tiptap/extensions',
            '@tiptap/pm',
            '@floating-ui/react',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            'lodash.throttle',
            'react-hotkeys-hook'
          ],
          output: {
            exports: 'named',
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'react/jsx-runtime'
            },
            // 保留樣式檔案
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                return 'styles/[name][extname]'
              }
              return 'assets/[name]-[hash][extname]'
            }
          }
        },
        cssCodeSplit: true,
        sourcemap: true,
        emptyOutDir: false
      }
    }
  }

  // 開發模式配置
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
