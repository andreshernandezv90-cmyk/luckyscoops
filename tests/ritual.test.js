import { test } from 'node:test'
import assert from 'node:assert/strict'
import { appliedItems, buildRitual, liquidFor, ritualDuration, scoopColors } from '../src/lib/ritual.js'

const recipe = { intention: 'amor', size: 'gran_bruja', extras: ['cristal'] }

test('el ritual sigue el orden: intención, tamaño, extras', () => {
  const ritual = buildRitual(recipe)
  assert.deepEqual(ritual.items.map((i) => i.id), ['intention', 'size', 'cristal'])
  const phases = ritual.steps.map((s) => s.phase)
  assert.equal(phases[0], 'intro')
  assert.equal(phases.at(-1), 'shimmer')
  assert.ok(phases.indexOf('pour') < phases.indexOf('drop'))
  assert.equal(phases.filter((p) => p === 'stir').length, 3, 'mezcla tras intención, tamaño y extras')
})

test('cada paso dura entre 0.25 y 0.7 s y el total es breve', () => {
  const ritual = buildRitual(recipe)
  for (const step of ritual.steps) assert.ok(step.duration >= 250 && step.duration <= 700)
  assert.ok(ritualDuration(ritual) < 8000)
})

test('el líquido cambia: rosa → rosa + dorado → + destellos morados', () => {
  const ritual = buildRitual(recipe)
  const pourIntention = ritual.steps.findIndex((s) => s.applies === 0)
  const pourSize = ritual.steps.findIndex((s) => s.applies === 1)
  const dropCrystal = ritual.steps.findIndex((s) => s.applies === 2)

  assert.equal(liquidFor(ritual, appliedItems(ritual, pourIntention - 1)).base, null)
  const pink = liquidFor(ritual, appliedItems(ritual, pourIntention))
  assert.equal(pink.base, '#d9577a')
  assert.equal(pink.swirl, null)
  const gold = liquidFor(ritual, appliedItems(ritual, pourSize))
  assert.equal(gold.swirl, '#e8b934')
  const sparkles = liquidFor(ritual, appliedItems(ritual, dropCrystal))
  assert.deepEqual(sparkles.flecks, ['#9a5ae0'])
  assert.equal(scoopColors(ritual).length, 3)
})

test('sin extras no hay mezcla extra', () => {
  const ritual = buildRitual({ intention: 'limpieza', size: 'aprendiz', extras: [] })
  assert.equal(ritual.items.length, 2)
  assert.equal(ritual.steps.filter((s) => s.phase === 'stir').length, 2)
})
