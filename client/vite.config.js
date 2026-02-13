import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Ensure there's only a single React copy to avoid
    // "Invalid hook call" errors from duplicate React instances.
    dedupe: ['react', 'react-dom'],
  },
})