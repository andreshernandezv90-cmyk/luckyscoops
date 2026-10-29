import { PRICES } from './prices.js'

/**
 * Scoops preparadas: combinaciones listas para comprar sin hacer el ritual.
 * Su precio se calcula con la misma lógica que las del Grimorio
 * (ver src/lib/pricing.js), menos el descuento definido en prices.js.
 *
 * TODO / PENDIENTE: son ejemplos. Reemplázalos por las Scoops reales del negocio.
 */
export const PRODUCTS = [
  {
    id: 'corazon-propio',
    name: 'Corazón Propio',
    badge: 'Amor',
    intention: 'amor',
    size: 'hechicera',
    extras: ['cristal'],
    description: 'Una Scoop de amor dedicada a ti, con un cristal sorpresa extra.',
  },
  {
    id: 'escudo-del-hogar',
    name: 'Escudo del Hogar',
    badge: 'Para la casa',
    intention: 'proteccion',
    size: 'gran_bruja',
    extras: ['amuleto'],
    description: 'Protección para tu espacio, con un amuleto sorpresa.',
  },
  {
    id: 'buena-fortuna',
    name: 'Buena Fortuna',
    badge: 'Abundancia',
    intention: 'abundancia',
    size: 'hechicera',
    extras: ['amuleto'],
    description: 'Una Scoop para atraer la buena suerte, con amuleto sorpresa.',
  },
  {
    id: 'nuevo-comienzo',
    name: 'Nuevo Comienzo',
    badge: 'Para empezar',
    intention: 'limpieza',
    size: 'aprendiz',
    extras: [],
    description: 'Una Scoop pequeña para renovar tu energía y empezar de nuevo.',
  },
].map((product) => ({ ...product, discount: PRICES.productDiscounts[product.id] ?? 0 }))

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id) ?? null
