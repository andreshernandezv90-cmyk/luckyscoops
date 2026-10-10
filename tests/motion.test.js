import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  arcKeyframes,
  BOOK_CLOSE,
  BOOK_OPEN,
  BOOK_OPEN_NAVIGATE_MS,
  leafKeyframes,
  pageTurnPlan,
  reachedPhase,
  REVEAL_STEPS,
  revealDuration,
  revealScene,
  stirKeyframes,
} from '../src/lib/motion.js'
import { buildRitual, STEP_MS } from '../src/lib/ritual.js'
import { isSoundOn, playSound, SOUND_FILES } from '../src/lib/sound.js'

const LAYERS = ['cover', 'bookY', 'bookX', 'bookScale', 'shadow', 'shadowX', 'pageShade', 'leafA', 'leafB', 'glint', 'frontShade', 'insideShade']

function assertTimeline(plan, keys) {
  assert.equal(plan.times[0], 0)
  assert.equal(plan.times.at(-1), 1)
  plan.times.forEach((t, i) => i > 0 && assert.ok(t > plan.times[i - 1], 'tiempos crecientes'))
  if (plan.ease && Array.isArray(plan.ease)) assert.equal(plan.ease.length, plan.times.length - 1)
  for (const key of keys) assert.equal(plan[key].length, plan.times.length, `${key} tiene un valor por fotograma`)
}

test('abrir el Grimorio: tapa pesada de 0.9–1.3 s que termina abierta', () => {
  assertTimeline(BOOK_OPEN, LAYERS)
  assert.ok(BOOK_OPEN.duration >= 0.9 && BOOK_OPEN.duration <= 1.3)
  assert.equal(BOOK_OPEN.cover[0], 0)
  assert.equal(BOOK_OPEN.cover.at(-1), -160)
  assert.ok(Math.min(...BOOK_OPEN.cover) < -160, 'se pasa un poco antes de asentarse')
  assert.ok(BOOK_OPEN.cover[1] > -10, 'arranca despacio (anticipación)')
  assert.ok(BOOK_OPEN_NAVIGATE_MS >= BOOK_OPEN.duration * 1000, 'navega cuando la tapa ya se abrió')
})

test('cerrar el Grimorio termina con la tapa sobre las páginas', () => {
  assertTimeline(BOOK_CLOSE, LAYERS)
  assert.equal(BOOK_CLOSE.cover[0], -160)
  assert.equal(BOOK_CLOSE.cover.at(-1), 0)
  assert.ok(BOOK_CLOSE.cover.every((a) => a <= 0), 'la tapa nunca atraviesa las páginas')
})

test('pasar página: hoja en escritorio, giro simple en celular y fundido con movimiento reducido', () => {
  const next = pageTurnPlan(1)
  const prev = pageTurnPlan(-1)
  assert.equal(next.mode, 'leaf')
  assert.equal(next.origin, 'left')
  assert.equal(next.to, -180, 'avanzar: la hoja derecha pasa a la izquierda')
  assert.equal(prev.origin, 'right')
  assert.equal(prev.to, 180, 'retroceder: la hoja izquierda vuelve a la derecha')
  assert.ok(next.duration >= 0.5 && next.duration <= 0.75)
  assert.ok(next.revealAt >= 0.4, 'el contenido nuevo aparece cuando la hoja cruza la mitad')
  assert.equal(pageTurnPlan(1, { compact: true }).mode, 'flip')
  assert.ok(pageTurnPlan(1, { compact: true }).duration <= next.duration)
  assert.equal(pageTurnPlan(1, { reduce: true }).mode, 'fade')
  assert.equal(pageTurnPlan(-1, { compact: true, reduce: true }).mode, 'fade', 'movimiento reducido gana siempre')
})

test('la hoja se curva y cruza el lomo a la mitad del giro', () => {
  for (const forward of [true, false]) {
    const kf = leafKeyframes(forward)
    assertTimeline(kf, ['rotateY', 'scaleX', 'skewY', 'opacity', 'frontShade', 'backShade', 'spine'])
    const mid = kf.times.indexOf(0.5)
    assert.equal(Math.abs(kf.rotateY[mid]), 90)
    assert.ok(kf.scaleX[mid] < 1, 'más angosta mientras está de pie')
    assert.equal(Math.abs(kf.rotateY.at(-1)), 180)
  }
})

test('los frascos vuelan en arco: salen del estante, suben y llegan al caldero', () => {
  const from = { x: 116, y: 46 }
  const to = { x: 166, y: 134 }
  const arc = arcKeyframes(from, to)
  assertTimeline(arc, ['x', 'y', 'scale', 'rotate'])
  assert.deepEqual([arc.x[0], arc.y[0]], [from.x, from.y])
  assert.deepEqual([arc.x.at(-1), arc.y.at(-1)], [to.x, to.y])
  assert.ok(arc.y[1] > from.y, 'anticipación: se agacha antes de subir')
  assert.ok(Math.min(...arc.y) < Math.min(from.y, to.y), 'el arco pasa por encima de ambos puntos')
  assert.equal(arc.rotate.at(-1), 0, 'llega derecho, listo para inclinarse')
})

test('la cuchara recorre una elipse y vuelve al reposo', () => {
  const stir = stirKeyframes()
  assertTimeline({ ...stir, ease: null }, ['x', 'y', 'rotate'])
  assert.deepEqual([stir.x[0], stir.y[0], stir.rotate[0]], [0, 0, 0])
  assert.deepEqual([stir.x.at(-1), stir.y.at(-1), stir.rotate.at(-1)], [0, 0, 0])
  assert.ok(Math.max(...stir.x) - Math.min(...stir.x) > 50, 'recorre el caldero de lado a lado')
  assert.ok(Math.max(...stir.y) - Math.min(...stir.y) < 30, 'elipse aplanada por la perspectiva')
  assert.ok(Math.min(...stir.y) < -8, 'sale parcialmente del líquido al final')
})

test('el ritual usa pasos cortos y un vuelo propio para los extras', () => {
  const ritual = buildRitual({ intention: 'abundancia', size: 'aprendiz', extras: ['amuleto'] })
  const flights = ritual.steps.filter((s) => s.phase === 'fly')
  assert.equal(flights[0].duration, STEP_MS.fly)
  assert.equal(flights.at(-1).duration, STEP_MS.toss)
  assert.ok(STEP_MS.toss < STEP_MS.fly)
})

test('revelación: silencio, luz, cuchara, invocación y nombre, en ese orden', () => {
  assert.deepEqual(
    REVEAL_STEPS.map((s) => s.phase),
    ['hush', 'glow', 'dip', 'lift', 'summon', 'name'],
  )
  for (const step of REVEAL_STEPS) assert.ok(step.duration >= 300 && step.duration <= 1000)
  assert.ok(revealDuration() < 5000, 'breve; además se puede saltar')
  const name = REVEAL_STEPS.find((s) => s.phase === 'name')
  assert.ok(name.duration >= 500 && name.duration <= 800, 'pausa para disfrutar antes de la compra')
})

test('cada fase de la revelación pinta el estado correcto', () => {
  assert.equal(revealScene('hush').activity, 'idle', 'el caldero se calma primero')
  assert.equal(revealScene('hush').scoop, false)
  assert.ok(revealScene('glow').innerGlow > revealScene('hush').innerGlow)
  assert.equal(revealScene('dip').spoon, 'dip')
  assert.equal(revealScene('lift').spoon, 'lift')
  assert.equal(revealScene('lift').spoonful, true)
  assert.equal(revealScene('lift').scoop, false, 'la Scoop no aparece de golpe')
  assert.equal(revealScene('summon').scoop, true)
  assert.equal(revealScene('summon').name, false)
  // Estado final (también al saltar o con movimiento reducido)
  const end = revealScene('reveal')
  assert.equal(end.spoon, 'lift')
  assert.equal(end.scoop, true)
  assert.equal(end.name, true)
  assert.equal(end.drips, false)
  assert.ok(reachedPhase('reveal', 'summon'))
  assert.ok(!reachedPhase('dip', 'lift'))
})

test('el sonido empieza apagado y nunca falla', () => {
  assert.equal(isSoundOn(), false)
  assert.doesNotThrow(() => playSound('reveal'))
  assert.ok(Object.values(SOUND_FILES).every((f) => f === null), 'audios definitivos pendientes')
})
