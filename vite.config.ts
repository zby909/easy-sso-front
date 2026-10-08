import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // 测试环境禁用开发工具，避免Inspector虚拟脚本404和悬浮面板干扰验收。
    process.env.NODE_ENV !== 'test' && vueDevTools(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/components.d.ts',
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // 将第三方库单独打包
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          utils: ['axios', 'dayjs'],
        },
      },
    },
  },
  // 预览生产包时请求使用 /api；保留此前缀并固定端口，匹配后端开发来源白名单。
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true },
    },
  },
  server: {
    proxy: {
      '/proxy': {
        target: 'http://127.0.0.1:3000', // 开发环境后端，生产使用同源 /api
        changeOrigin: true, //允许跨域
        rewrite: path => path.replace(/^\/proxy/, ''),
      },
    },
  },
});
