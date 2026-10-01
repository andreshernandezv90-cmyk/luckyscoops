import { PRICES } from './prices.js'

/**
 * Intenciones (Capítulo I).
 * - `colors.liquid` / `colors.deep`: color de la poción y del líquido del caldero.
 * - `effect`: tipo de partículas que acompañan la selección y el ritual.
 */
export const INTENTIONS = [
  {
    id: 'amor',
    name: 'Amor',
    of: 'del Amor',
    verb: 'Atraer amor',
    short: 'Armonía, cariño y conexión.',
    description:
      'Una preparación asociada con la armonía, el cariño, la conexión y la energía amorosa.',
    ingredients: 'Cuarzo rosa, pétalos de rosa y canela',
    effect: 'hearts',
    colors: { liquid: '#d9577a', deep: '#7d1d3a', glow: '#ff9fbc' },
    ritualLine: 'La esencia rosada del Amor cae en el caldero.',
  },
  {
    id: 'proteccion',
    name: 'Protección',
    of: 'de la Protección',
    verb: 'Protegerte',
    short: 'Tranquilidad y resguardo.',
    description:
      'Una preparación asociada con la protección, la tranquilidad y la energía que resguarda.',
    ingredients: 'Turmalina negra, romero y sal de mar',
    effect: 'runes',
    colors: { liquid: '#5a4fcf', deep: '#2a1b5e', glow: '#a9a3ff' },
    ritualLine: 'El elixir índigo de la Protección se vierte con calma.',
  },
  {
    id: 'abundancia',
    name: 'Abundancia',
    of: 'de la Abundancia',
    verb: 'Atraer abundancia',
    short: 'Prosperidad y crecimiento.',
    description:
      'Una preparación asociada con la prosperidad, el crecimiento y la abundancia.',
    ingredients: 'Pirita, citrino y hojas de laurel',
    effect: 'coins',
    colors: { liquid: '#c9a227', deep: '#1f5a36', glow: '#f6dc7a' },
    ritualLine: 'El oro verde de la Abundancia brilla al caer.',
  },
  {
    id: 'limpieza',
    name: 'Limpieza',
    of: 'de la Limpieza',
    verb: 'Limpiar tu energía',
    short: 'Renovación y claridad.',
    description:
      'Una preparación asociada con la limpieza energética y la renovación.',
    ingredients: 'Selenita, lavanda y salvia blanca',
    effect: 'smoke',
    colors: { liquid: '#d9cff2', deep: '#6d4fa6', glow: '#ffffff' },
    ritualLine: 'La bruma violeta de la Limpieza desciende en silencio.',
  },
].map((intention) => ({ ...intention, priceAdjustment: PRICES.intentions[intention.id] ?? 0 }))

export const getIntention = (id) => INTENTIONS.find((i) => i.id === id) ?? null
