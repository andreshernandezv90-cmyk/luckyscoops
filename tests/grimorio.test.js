import { test } from 'node:test'
import assert from 'node:assert/strict'
import { INTENTIONS } from '../src/data/intentions.js'
import { EXTRAS } from '../src/data/extras.js'
import { SIZES } from '../src/data/sizes.js'
import { PRICES } from '../src/data/prices.js'
import { PRODUCTS } from '../src/data/products.js'
import { FAQ } from '../src/data/faq.js'
import { RECOMMENDATIONS, recommendExtra } from '../src/data/recommendations.js'
import { CHAPTERS } from '../src/data/chapters.js'
import { orderMessage } from '../src/lib/order.js'
import { cartTotals } from '../src/lib/pricing.js'
import { BRAND } from '../src/config/brand.js'

test('el Grimorio tiene seis capítulos en orden, numerados I–VI', () => {
  assert.deepEqual(
    CHAPTERS.map((c) => c.id),
    ['intencion', 'tamano', 'ingredientes', 'dedicatoria', 'preparacion', 'revelacion'],
  )
  assert.deepEqual(
    CHAPTERS.map((c) => c.numeral),
    ['I', 'II', 'III', 'IV', 'V', 'VI'],
  )
})

test('las cuatro intenciones son generales: sin subtipos ni «Personaliza»', () => {
  assert.deepEqual(
    INTENTIONS.map((i) => i.name),
    ['Amor', 'Protección', 'Abundancia', 'Limpieza'],
  )
  for (const intention of INTENTIONS) {
    assert.equal(intention.focuses, undefined)
    assert.equal(intention.themes, undefined)
  }
  for (const product of PRODUCTS) assert.equal(product.focus, undefined, product.id)
  const visible = JSON.stringify([CHAPTERS, INTENTIONS, EXTRAS, FAQ, BRAND.heroText])
  assert.doesNotMatch(visible, /Personaliza|Enfoque|Sin preferencia|Video de tu ritual|Amor propio/i)
})

test('la Carta natal sustituye al video y Gran Bruja la incluye', () => {
  const ids = EXTRAS.map((e) => e.id)
  assert.ok(ids.includes('carta_natal'))
  assert.ok(!ids.includes('video'))
  assert.equal(EXTRAS.find((e) => e.id === 'carta_natal').name, 'Carta natal')
  assert.equal(PRICES.extras.carta_natal, null, 'el precio sigue pendiente: no se inventa')
  assert.deepEqual(
    SIZES.map((s) => [s.id, s.includedExtras]),
    [['aprendiz', []], ['hechicera', []], ['gran_bruja', ['carta_natal']]],
  )
})

test('las recomendaciones apuntan a extras que existen', () => {
  const ids = new Set(EXTRAS.map((e) => e.id))
  for (const rec of Object.values(RECOMMENDATIONS)) assert.ok(ids.has(rec.extra), rec.extra)
  for (const intention of INTENTIONS) assert.ok(recommendExtra({ intention: intention.id }), intention.id)
  assert.equal(recommendExtra({ intention: 'amor' }).extra, 'cristal')
  assert.equal(recommendExtra({}), null)
})

test('la marca no inventa datos de contacto', () => {
  for (const value of Object.values(BRAND.contact)) assert.equal(value, null)
  assert.equal(BRAND.name, 'Scoops de la Bruja Sabia')
})

test('el mensaje del pedido incluye extras y dedicatoria, sin enfoque', () => {
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
  assert.doesNotMatch(text, /Enfoque|Amor propio/, 'un dato antiguo de enfoque no llega al pedido')
  assert.match(text, /Extras: Cristal sorpresa, Carta natal \(incluida con Gran Bruja\)/)
  assert.match(text, /Dedicatoria: "Que nunca te falte magia"/)
  assert.match(text, /Envío: por cotizar/)
})
