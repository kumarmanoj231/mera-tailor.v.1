import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/');
          if (!normalizedId.includes('/node_modules/')) return;

          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(normalizedId)) {
            return 'react-vendor';
          }
          if (normalizedId.includes('/node_modules/@clerk/')) return 'clerk-vendor';
          if (/\/node_modules\/(i18next|react-i18next)\//.test(normalizedId)) return 'translation-vendor';
        },
      },
    },
  },
  server: { proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } } },
})
