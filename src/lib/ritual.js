import { getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { getExtra } from '../data/extras.js'
import { normalizeExtras } from './pricing.js'

/**
 * Convierte la receta en el guion del ritual del caldero.
 *
 * items: lo que entra al caldero (esencia de intención, poción de tamaño, extras)
 * steps: secuencia de fases cortas (0.2–0.6 s) que la animación interpreta:
 *   intro · fly · tilt · pour · bubble · stir · drop · shimmer
 *
 * Algunos movimientos duran un poco más que su paso y se encadenan con el
 * siguiente (la cuchara termina su vuelta mientras llega el próximo frasco):
 * así el ritual se siente continuo sin alargarse.
 */
export const STEP_MS = {
  intro: 250,
  /** Vuelo en arco de un frasco (con anticipación y sobrepasada). */
  fly: 520,
  /** Vuelo más corto de un ingrediente extra. */
  toss: 400,
  tilt: 240,
  pour: 520,
  bubble: 300,
  stir: 500,
  drop: 340,
  shimmer: 600,
}

export function buildRitual({ intention, size, extras = [] }) {
  const i = getIntention(intention)
  const s = getSize(size)
  const extrasData = normalizeExtras(extras).map(getExtra)

  const items = []
  if (i) {
    items.push({
      id: 'intention',
      kind: 'bottle',
      shape: i.bottle ?? 'round',
      name: `Esencia ${i.of}`,
      color: i.colors.liquid,
      deep: i.colors.deep,
      glow: i.colors.glow,
      line: i.ritualLine,
    })
  }
  if (s) {
    items.push({
      id: 'size',
      kind: 'bottle',
      shape: 'vial',
      name: `Poción ${s.name}`,
      color: s.essence,
      deep: s.essence,
      glow: s.essence,
      line: `Se añade la poción ${s.name}: ${s.essenceName}.`,
    })
  }
  for (const e of extrasData) {
    items.push({
      id: e.id,
      kind: 'extra',
      name: e.name,
      color: e.color,
      glow: e.color,
      line: `${e.name} entra al caldero: ${e.colorName}.`,
    })
  }

  const steps = [{ phase: 'intro', duration: STEP_MS.intro, line: 'El fuego despierta bajo el caldero.' }]
  items.forEach((item, index) => {
    if (item.kind === 'bottle') {
      steps.push({ phase: 'fly', item: index, duration: STEP_MS.fly, line: item.line })
      steps.push({ phase: 'tilt', item: index, duration: STEP_MS.tilt, line: item.line })
      steps.push({
        phase: 'pour',
        item: index,
        applies: index,
        duration: STEP_MS.pour,
        line: item.line,
        burst: item.id === 'size' ? { effect: 'sparkles', colors: [item.color, '#fff4d6'] } : null,
      })
      if (item.id === 'intention') {
        steps.push({
          phase: 'bubble',
          duration: STEP_MS.bubble,
          line: 'El caldero burbujea y sale humo.',
          burst: { effect: i.effect, colors: [i.colors.glow, i.colors.liquid, '#fff4d6'] },
        })
      }
      steps.push({ phase: 'stir', duration: STEP_MS.stir, line: 'La cuchara revuelve la mezcla.' })
    } else {
      steps.push({ phase: 'fly', item: index, duration: STEP_MS.toss, line: item.line })
      steps.push({
        phase: 'drop',
        item: index,
        applies: index,
        duration: STEP_MS.drop,
        line: item.line,
        burst: { effect: 'sparkles', colors: [item.color, '#fff4d6'] },
      })
      // La cuchara vuelve a revolver después de cada ingrediente.
      steps.push({ phase: 'stir', duration: STEP_MS.stir, line: 'La cuchara mezcla nuevamente.' })
    }
  })
  steps.push({
    phase: 'shimmer',
    duration: STEP_MS.shimmer,
    line: 'El líquido cambia de color: la mezcla está lista.',
    burst: { effect: 'sparkles', colors: items.map((it) => it.glow).concat('#fff4d6') },
  })

  return { items, steps }
}

/** Índices de los ingredientes que ya están dentro del caldero en el paso `index`. */
export function appliedItems(ritual, index) {
  const applied = new Set()
  ritual.steps.forEach((step, i) => {
    if (step.applies !== undefined && i <= index) applied.add(step.applies)
  })
  return applied
}

/** Colores del líquido según lo que ya se vertió. */
export function liquidFor(ritual, applied) {
  const liquid = { base: null, glow: null, swirl: null, flecks: [] }
  ritual.items.forEach((item, i) => {
    if (!applied.has(i)) return
    if (item.id === 'intention') {
      liquid.base = item.color
      liquid.glow = item.glow
    } else if (item.id === 'size') {
      liquid.swirl = item.color
      liquid.glow = liquid.glow ?? item.glow
    } else {
      liquid.flecks.push(item.color)
    }
  })
  return liquid
}

/** Colores de la Scoop que sale en la cuchara: intención + tamaño + extras. */
export function scoopColors(ritual) {
  return ritual.items.map((item) => item.color)
}

/** Duración total en milisegundos (útil para pruebas y para ajustar ritmos). */
export const ritualDuration = (ritual) => ritual.steps.reduce((sum, s) => sum + s.duration, 0)
