import { PRICES } from './prices.js'

/** Ingredientes extra (Capítulo III). Se puede elegir más de uno. */
export const EXTRAS = [
  {
    id: 'cristal',
    name: 'Cristal sorpresa',
    description: 'Un cristal elegido al azar por nuestras manos, distinto en cada frasco.',
    color: '#9a5ae0',
    colorName: 'destellos morados',
  },
  {
    id: 'amuleto',
    name: 'Amuleto sorpresa',
    description: 'Un dije de metal envejecido para llevar contigo tu intención.',
    color: '#c98d3a',
    colorName: 'chispas de bronce',
  },
  {
    id: 'video',
    name: 'Video personalizado',
    description: 'Grabamos la preparación de tu Scoop y te enviamos el video por WhatsApp.',
    color: '#8cc8e6',
    colorName: 'reflejos de plata azul',
  },
  {
    id: 'regalo',
    name: 'Empaque para regalo',
    description: 'Caja de cartón kraft, listón de terciopelo y tarjeta escrita a mano.',
    color: '#b8324f',
    colorName: 'hilos color vino',
  },
].map((extra) => ({ ...extra, price: PRICES.extras[extra.id] }))

export const getExtra = (id) => EXTRAS.find((e) => e.id === id) ?? null
