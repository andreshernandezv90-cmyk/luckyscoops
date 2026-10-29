import { PRICES } from './prices.js'

/**
 * Intenciones (Capítulo I). Cada una es general: no tiene subtipos que elegir.
 * - `colors.liquid` / `colors.deep`: color de la poción y del líquido del caldero.
 * - `bottle`: forma de su botella (ver PotionBottle.jsx).
 * - `effect`: tipo de partículas que acompañan la selección y el ritual.
 */
const BASE_INTENTIONS = [
  {
    id: 'amor',
    bottle: 'round',
    name: 'Amor',
    of: 'del Amor',
    description: 'Una preparación asociada con el cariño, la atracción y la armonía en tus vínculos.',
    effect: 'hearts',
    colors: { liquid: '#e0558f', deep: '#7a1d52', glow: '#ffa3cf' },
    ritualLine: 'La esencia rosada del Amor cae en el caldero.',
  },
  {
    id: 'proteccion',
    bottle: 'tall',
    name: 'Protección',
    of: 'de la Protección',
    description: 'Una preparación asociada con el resguardo, la tranquilidad y el cuidado energético.',
    effect: 'runes',
    colors: { liquid: '#6a4fd8', deep: '#2a1766', glow: '#b3a6ff' },
    ritualLine: 'El elixir índigo de la Protección se vierte con calma.',
  },
  {
    id: 'abundancia',
    bottle: 'flask',
    name: 'Abundancia',
    of: 'de la Abundancia',
    description: 'Una preparación asociada con la prosperidad, el trabajo y la buena fortuna.',
    effect: 'coins',
    colors: { liquid: '#d4a72c', deep: '#2f5e2a', glow: '#f8df7c' },
    ritualLine: 'El oro de la Abundancia brilla al caer.',
  },
  {
    id: 'limpieza',
    bottle: 'drop',
    name: 'Limpieza',
    of: 'de la Limpieza',
    description: 'Una preparación asociada con la renovación, la limpieza energética y los nuevos comienzos.',
    effect: 'smoke',
    colors: { liquid: '#ddd2f6', deep: '#7650b8', glow: '#ffffff' },
    ritualLine: 'La bruma violeta de la Limpieza desciende en silencio.',
  },
]

export const INTENTIONS = BASE_INTENTIONS.map((intention) => ({
  ...intention,
  priceAdjustment: PRICES.intentions[intention.id] ?? 0,
}))

export const getIntention = (id) => INTENTIONS.find((i) => i.id === id) ?? null

