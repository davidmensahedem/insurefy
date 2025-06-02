import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['@xenova/transformers']
  },
  define: {
    // Fallback environment variables for production
    'import.meta.env.VITE_MCP_SERVER_URL': JSON.stringify(
      process.env.VITE_MCP_SERVER_URL || 'wss://f342-154-161-21-202.ngrok-free.app'
    ),
    'import.meta.env.VITE_APP_ENVIRONMENT': JSON.stringify(
      process.env.VITE_APP_ENVIRONMENT || 'production'
    ),
  }
}) 