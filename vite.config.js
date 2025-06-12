import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Tile-Simulator-Dashboard/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  }
})
