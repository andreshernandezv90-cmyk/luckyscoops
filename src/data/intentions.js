import { PRICES } from './prices.js'

/** Opción presente en todas las intenciones: conserva el factor sorpresa. */
export const WITCH_CHOICE = {
  id: 'bruja',
  name: 'Déjalo en manos de la Bruja Sabia',
  short: 'Sin preferencia',
  description: 'Ella elegirá lo que tu Scoop necesita. Conserva toda la sorpresa.',
}

/**
 * Intenciones (Capítulo I) y sus enfoques (Capítulo II).
 * - `colors.liquid` / `colors.deep`: color de la poción y del líquido del caldero.
 * - `bottle`: forma de su botella (ver PotionBottle.jsx).
 * - `effect`: tipo de partículas que acompañan la selección y el ritual.
 * - `focuses`: personalizaciones posibles; siempre se añade WITCH_CHOICE al final.
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
    focuses: [
      { id: 'amor_propio', name: 'Amor propio', description: 'Para quererte, cuidarte y reconocerte.' },
      { id: 'pareja', name: 'Pareja', description: 'Para cuidar y fortalecer una relación.' },
      { id: 'atraccion', name: 'Atracción', description: 'Para abrirte a nuevas conexiones.' },
      { id: 'armonia', name: 'Armonía', description: 'Para la paz y el equilibrio en tus vínculos.' },
    ],
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
    focuses: [
      { id: 'proteccion', name: 'Protección', description: 'Para sentirte resguardada o resguardado.' },
      { id: 'resguardo', name: 'Resguardo', description: 'Para tu hogar, tu espacio o tu familia.' },
      { id: 'tranquilidad', name: 'Tranquilidad', description: 'Para la calma y la paz interior.' },
      { id: 'cuidado_energetico', name: 'Cuidado energético', description: 'Para cuidar tu energía día a día.' },
    ],
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
    focuses: [
      { id: 'dinero', name: 'Dinero', description: 'Para tus finanzas y tu economía.' },
      { id: 'trabajo', name: 'Trabajo', description: 'Para tu empleo y tus proyectos.' },
      { id: 'negocio', name: 'Negocio', description: 'Para tu emprendimiento y tus ventas.' },
      { id: 'oportunidades', name: 'Nuevas oportunidades', description: 'Para que se abran caminos.' },
      { id: 'buena_fortuna', name: 'Buena fortuna', description: 'Para atraer la buena suerte.' },
    ],
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
    focuses: [
      { id: 'renovacion', name: 'Renovación', description: 'Para soltar lo viejo y renovarte.' },
      { id: 'limpieza_energetica', name: 'Limpieza energética', description: 'Para despejar tu energía y tu espacio.' },
      { id: 'cierre_ciclos', name: 'Cierre de ciclos', description: 'Para despedir etapas con calma.' },
      { id: 'nuevos_comienzos', name: 'Nuevos comienzos', description: 'Para empezar algo nuevo con buena energía.' },
    ],
  },
]

export const INTENTIONS = BASE_INTENTIONS.map((intention) => ({
  ...intention,
  focuses: [...intention.focuses, WITCH_CHOICE],
  /** Temas que se muestran en la tarjeta del Capítulo I. */
  themes: intention.focuses.map((f) => f.name),
  priceAdjustment: PRICES.intentions[intention.id] ?? 0,
}))

export const getIntention = (id) => INTENTIONS.find((i) => i.id === id) ?? null

/** Enfoque elegido dentro de una intención (o null si no existe). */
export const getFocus = (intentionId, focusId) =>
  getIntention(intentionId)?.focuses.find((f) => f.id === focusId) ?? null
