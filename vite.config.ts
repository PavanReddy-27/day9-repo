/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
if (!process.env.VITE_COMPANY_NAME) {
  process.env.VITE_COMPANY_NAME = 'Stackly';
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend server unavailable', code: 'ECONNREFUSED' }));
            }
          });
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material', 'lucide-react', 'framer-motion'],
          datagrid: ['@mui/x-data-grid'],
          charting: ['recharts', 'd3'],
          export: ['jspdf', 'jspdf-autotable', 'papaparse'],
          state: ['@reduxjs/toolkit', 'react-redux', '@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  }
})
