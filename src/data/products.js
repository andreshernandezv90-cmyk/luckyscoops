import { PRICES } from './prices.js'

/**
 * Scoops preparadas: combinaciones listas para comprar sin hacer el ritual.
 * Su precio se calcula con la misma lógica que las personalizadas
 * (ver src/lib/pricing.js), menos el descuento definido en prices.js.
 */
export const PRODUCTS = [
  {
    id: 'luna-de-miel',
    name: 'Luna de Miel',
    badge: 'La más pedida',
    intention: 'amor',
    size: 'hechicera',
    extras: ['cristal'],
    description: 'Cuarzo rosa, pétalos secos y un cristal sorpresa para cuidar los lazos que importan.',
  },
  {
    id: 'escudo-del-hogar',
    name: 'Escudo del Hogar',
    badge: 'Para la casa',
    intention: 'proteccion',
    size: 'gran_bruja',
    extras: ['amuleto'],
    description: 'Turmalina, romero y un amuleto de bronce para la entrada de tu hogar.',
  },
  {
    id: 'cosecha-dorada',
    name: 'Cosecha Dorada',
    badge: 'Edición completa',
    intention: 'abundancia',
    size: 'gran_bruja',
    extras: ['cristal', 'amuleto'],
    description: 'Pirita, citrino y laurel con cristal y amuleto sorpresa. Nuestra mezcla más generosa.',
  },
  {
    id: 'agua-de-luna',
    name: 'Agua de Luna',
    badge: 'Para empezar',
    intention: 'limpieza',
    size: 'aprendiz',
    extras: [],
    description: 'Selenita, lavanda y salvia en un frasco pequeño para renovar tu espacio.',
  },
].map((product) => ({ ...product, discount: PRICES.productDiscounts[product.id] ?? 0 }))

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id) ?? null
