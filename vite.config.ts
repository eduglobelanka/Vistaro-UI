import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7107',
        changeOrigin: true,
        secure: false, // Ignores SSL certificate errors for local development
      },
    },
  },
})
