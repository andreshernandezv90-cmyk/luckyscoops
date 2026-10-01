import { PRICES } from './prices.js'

/** Ingredientes adicionales para el ritual (Capítulo IV). Se puede elegir más de uno o ninguno. */
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
    id: 'video',
    name: 'Video de tu ritual',
    description: 'Si tu pedido incluye esta opción, podrás ver cómo la Bruja Sabia prepara tu Scoop.',
    color: '#8cc8e6',
    colorName: 'reflejos de plata azul',
  },
  {
    id: 'regalo',
    name: 'Empaque para regalo',
    description: 'Una presentación especial para regalar tu Scoop.',
    color: '#ec5fa6',
    colorName: 'listones rosas',
  },
].map((extra) => ({ ...extra, price: PRICES.extras[extra.id] ?? 0 }))

export const getExtra = (id) => EXTRAS.find((e) => e.id === id) ?? null
