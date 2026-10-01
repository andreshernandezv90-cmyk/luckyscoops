import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Rutas relativas: el sitio funciona igual en la raíz de un dominio o en una subcarpeta.
  base: './',
})
