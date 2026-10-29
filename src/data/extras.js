import { PRICES } from './prices.js'

/**
 * Ingredientes adicionales para el ritual (Capítulo III). Se puede elegir más de uno o ninguno.
 * Algunos tamaños ya incluyen un extra (ver `includedExtras` en sizes.js): entonces no se cobra.
 * `price: null` = precio pendiente de confirmar (ver prices.js).
 */
export const EXTRAS = [
  {
    id: 'cristal',
    name: 'Cristal sorpresa',
    description: 'Un cristal adicional elegido por la Bruja Sabia para tu intención.',
    color: '#a35ee8',
    colorName: 'destellos morados',
  },
  {
    id: 'amuleto',
    name: 'Amuleto sorpresa',
    description: 'Un amuleto elegido por la Bruja Sabia para llevar contigo tu intención.',
    color: '#d39a3c',
    colorName: 'chispas doradas',
  },
  {
    id: 'carta_natal',
    name: 'Carta natal',
    description: 'Una carta natal hecha por la Bruja Sabia a partir del nombre completo y la fecha de nacimiento.',
    color: '#8cc8e6',
    colorName: 'reflejos de plata azul',
    /** Pide datos de la persona para quien se hace (ver Checkout → «Datos para tu Carta natal»). */
    needsBirthData: true,
  },
  {
    id: 'regalo',
    name: 'Empaque para regalo',
    description: 'Una presentación especial para regalar tu Scoop.',
    color: '#ec5fa6',
    colorName: 'listones rosas',
  },
  // `null` se conserva (precio por confirmar); un extra sin entrada en la tabla cuesta 0.
].map((extra) => ({ ...extra, price: extra.id in PRICES.extras ? PRICES.extras[extra.id] : 0 }))

export const getExtra = (id) => EXTRAS.find((e) => e.id === id) ?? null
