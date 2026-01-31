import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/dashboard': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/overlay': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/blog': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/control-panel': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/ai-world': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/home': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    },
    middlewareMode: false,
    hmr: {
      host: '192.168.1.180',
      port: 5173
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api')
    }
  }
})
