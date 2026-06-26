import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ─── Production Build ────────────────────────────────────────────────────
  // Output to frontend/dist — Flask serves this folder as static assets.
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    // All asset URLs will be relative to '/' so Flask can serve them from root.
    assetsDir: 'assets',
    // Warn at 1MB (the app uses recharts which is large).
    chunkSizeWarningLimit: 1024,
  },

  // Base public path — must match Flask's static serving root.
  base: '/',

  // ─── Development Server ───────────────────────────────────────────────────
  // `npm run dev` runs on port 5173. ALL /api requests are transparently
  // forwarded to the Flask backend running on port 5000, so you never need
  // to change any fetch() URL.
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ─── Preview (vite preview) ───────────────────────────────────────────────
  // Allows previewing the production build locally without Flask.
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
