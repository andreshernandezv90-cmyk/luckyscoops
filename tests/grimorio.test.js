import { test } from 'node:test'
import assert from 'node:assert/strict'
import { INTENTIONS, WITCH_CHOICE, getFocus } from '../src/data/intentions.js'
import { EXTRAS } from '../src/data/extras.js'
import { RECOMMENDATIONS, recommendExtra } from '../src/data/recommendations.js'
import { CHAPTERS } from '../src/data/chapters.js'
import { orderMessage } from '../src/lib/order.js'
import { cartTotals } from '../src/lib/pricing.js'
import { BRAND } from '../src/config/brand.js'

test('el Grimorio tiene siete capítulos en orden', () => {
  assert.deepEqual(
    CHAPTERS.map((c) => c.id),
    ['intencion', 'enfoque', 'tamano', 'ingredientes', 'dedicatoria', 'preparacion', 'revelacion'],
  )
})

test('cada intención ofrece sus enfoques y siempre "Déjalo en manos de la Bruja Sabia"', () => {
  for (const intention of INTENTIONS) {
    assert.ok(intention.focuses.length >= 5)
    assert.equal(intention.focuses.at(-1).id, WITCH_CHOICE.id)
  }
  assert.equal(getFocus('amor', 'amor_propio').name, 'Amor propio')
  assert.equal(getFocus('abundancia', 'dinero').name, 'Dinero')
  assert.equal(getFocus('amor', 'dinero'), null)
})

test('las recomendaciones apuntan a extras que existen', () => {
  const ids = new Set(EXTRAS.map((e) => e.id))
  for (const table of Object.values(RECOMMENDATIONS)) {
    for (const rec of Object.values(table)) assert.ok(ids.has(rec.extra), rec.extra)
  }
  assert.equal(recommendExtra({ intention: 'amor', focus: 'pareja' }).extra, 'regalo')
  assert.equal(recommendExtra({ intention: 'amor', focus: 'bruja' }).extra, 'cristal', 'sin enfoque usa la recomendación general')
  assert.equal(recommendExtra({}), null)
})

test('la marca no inventa datos de contacto', () => {
  for (const value of Object.values(BRAND.contact)) assert.equal(value, null)
  assert.equal(BRAND.name, 'Scoops de la Bruja Sabia')
})

test('el mensaje del pedido incluye enfoque, extras y dedicatoria', () => {
  const items = [
    {
      name: 'Scoop Gran Bruja del Amor',
      intention: 'amor',
      focus: 'amor_propio',
      size: 'gran_bruja',
      extras: ['cristal'],
      dedication: { forWhom: 'gift', message: 'Que nunca te falte magia' },
      quantity: 1,
      unitPrice: 448,
    },
  ]
  const order = {
    number: 'BS-0101-1234',
    items,
    totals: cartTotals(items),
    customer: { name: 'Ana', phone: '5500000000', address: null, notes: '' },
    paymentMethod: 'transferencia',
  }
  const text = orderMessage(order)
  assert.match(text, /BS-0101-1234/)
  assert.match(text, /Enfoque: Amor propio/)
  assert.match(text, /Extras: Cristal sorpresa/)
  assert.match(text, /Dedicatoria: "Que nunca te falte magia"/)
  assert.match(text, /Envío: por cotizar/)
})
