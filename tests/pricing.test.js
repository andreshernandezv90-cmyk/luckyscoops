import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PRICES } from '../src/data/prices.js'
import {
  calculateUnitPrice,
  cartTotals,
  itemKey,
  itemUnitPrice,
  normalizeExtras,
  priceBreakdown,
  productName,
} from '../src/lib/pricing.js'
import { formatPrice } from '../src/lib/format.js'

test('sin tamaño todavía no hay precio', () => {
  assert.equal(calculateUnitPrice({ intention: 'amor' }), null)
})

test('precio = base del tamaño + ajuste de intención + extras', () => {
  const config = { intention: 'amor', size: 'gran_bruja', extras: ['cristal'] }
  const expected = PRICES.sizes.gran_bruja + PRICES.intentions.amor + PRICES.extras.cristal
  assert.equal(calculateUnitPrice(config), expected)
  const b = priceBreakdown(config)
  assert.equal(b.base, PRICES.sizes.gran_bruja)
  assert.equal(b.extrasTotal, PRICES.extras.cristal)
})

test('los extras desconocidos o repetidos se ignoran y se ordenan', () => {
  assert.deepEqual(normalizeExtras(['regalo', 'cristal', 'cristal', 'pocion-falsa']), ['cristal', 'regalo'])
  assert.equal(
    calculateUnitPrice({ intention: 'limpieza', size: 'aprendiz', extras: ['cristal', 'cristal'] }),
    PRICES.sizes.aprendiz + PRICES.extras.cristal,
  )
})

test('nombre del producto', () => {
  assert.equal(productName({ intention: 'amor', size: 'gran_bruja' }), 'Scoop Gran Bruja del Amor')
  assert.equal(productName({ intention: 'proteccion', size: 'aprendiz' }), 'Scoop Aprendiz de la Protección')
})

test('las Scoops preparadas aplican su descuento', () => {
  const item = { productId: 'luna-de-miel', intention: 'amor', size: 'hechicera', extras: ['cristal'] }
  assert.equal(itemUnitPrice(item), calculateUnitPrice(item) - PRICES.productDiscounts['luna-de-miel'])
})

test('la misma receta genera la misma clave del carrito', () => {
  assert.equal(
    itemKey({ intention: 'amor', size: 'hechicera', extras: ['regalo', 'cristal'] }),
    itemKey({ intention: 'amor', size: 'hechicera', extras: ['cristal', 'regalo'] }),
  )
  assert.notEqual(itemKey({ intention: 'amor', size: 'hechicera' }), itemKey({ productId: 'luna-de-miel', intention: 'amor', size: 'hechicera' }))
})

test('totales del carrito y envío', () => {
  const small = [{ intention: 'amor', size: 'aprendiz', extras: [], quantity: 1 }]
  const t = cartTotals(small, 'envio')
  assert.equal(t.subtotal, PRICES.sizes.aprendiz)
  assert.equal(t.shipping, PRICES.shipping.standard)
  assert.equal(t.total, PRICES.sizes.aprendiz + PRICES.shipping.standard)
  assert.equal(cartTotals(small, 'recoger').shipping, 0)

  const big = [{ intention: 'amor', size: 'gran_bruja', extras: [], quantity: 3 }]
  assert.equal(cartTotals(big, 'envio').shipping, 0, 'envío gratis desde el mínimo')
  assert.equal(cartTotals(big).count, 3)
})

test('formato de precio en pesos', () => {
  assert.match(formatPrice(389), /^\$389 MXN$/)
  assert.equal(formatPrice(null), '—')
})
