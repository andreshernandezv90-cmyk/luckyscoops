import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { BRAND } from './src/config/brand.js'
import { PRICES } from './src/data/prices.js'

/**
 * Al compilar (`npm run build`) avisa qué datos del negocio faltan antes de
 * publicar. No detiene la compilación: en la versión publicada las marcas
 * "PENDIENTE" no se ven, así que este aviso es el único recordatorio.
 */
function launchCheck() {
  return {
    name: 'scoops-launch-check',
    apply: 'build',
    buildStart() {
      const issues = []
      const { whatsapp } = BRAND.contact
      if (!whatsapp) {
        issues.push('Falta el WhatsApp (src/config/brand.js → contact.whatsapp): los pedidos no le llegan a nadie.')
      } else if (!/^\d{10,15}$/.test(whatsapp)) {
        issues.push('El WhatsApp debe ir en formato internacional, solo números (p. ej. 5215500000000).')
      }
      if (PRICES.areDemo) {
        issues.push('Los precios son de demostración (src/data/prices.js → areDemo: true) y se mostrarán como reales.')
      }
      if (issues.length === 0) return
      console.warn(
        ['', '⚠  ANTES DE PUBLICAR · datos del negocio pendientes:', ...issues.map((i) => `   • ${i}`), ''].join('\n'),
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), launchCheck()],
  // Rutas relativas: el sitio funciona igual en la raíz de un dominio o en una subcarpeta.
  base: './',
})
