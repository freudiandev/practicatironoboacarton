import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // En producción usamos rutas relativas para que funcione en GitHub Pages (subpath) y en cualquier hosting estático.
  base: mode === 'production' ? './' : '/'
}))
