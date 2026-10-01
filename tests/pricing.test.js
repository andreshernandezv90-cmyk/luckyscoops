import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PRICES } from '../src/data/prices.js'
import {
  calculateUnitPrice,
  cartTotals,
  normalizeDedication,
  normalizeFocus,
  recipeTitle,
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

test('nombre del producto y título de la receta', () => {
  assert.equal(productName({ intention: 'amor', size: 'gran_bruja' }), 'Scoop Gran Bruja del Amor')
  assert.equal(productName({ intention: 'proteccion', size: 'aprendiz' }), 'Scoop Aprendiz de la Protección')
  assert.equal(recipeTitle({ intention: 'amor', size: 'gran_bruja' }), 'Gran Bruja del Amor')
})

test('las Scoops preparadas aplican su descuento', () => {
  const item = { productId: 'corazon-propio', intention: 'amor', size: 'hechicera', extras: ['cristal'] }
  assert.equal(itemUnitPrice(item), calculateUnitPrice(item) - PRICES.productDiscounts['corazon-propio'])
})

test('la misma receta genera la misma clave del carrito', () => {
  assert.equal(
    itemKey({ intention: 'amor', size: 'hechicera', extras: ['regalo', 'cristal'] }),
    itemKey({ intention: 'amor', size: 'hechicera', extras: ['cristal', 'regalo'] }),
  )
  assert.notEqual(itemKey({ intention: 'amor', size: 'hechicera' }), itemKey({ productId: 'corazon-propio', intention: 'amor', size: 'hechicera' }))
})

test('enfoque y dedicatoria distinguen líneas del carrito', () => {
  const base = { intention: 'amor', size: 'hechicera', extras: [] }
  assert.notEqual(itemKey({ ...base, focus: 'pareja' }), itemKey({ ...base, focus: 'amor_propio' }))
  assert.equal(itemKey({ ...base }), itemKey({ ...base, focus: 'bruja' }), 'sin enfoque = en manos de la Bruja Sabia')
  assert.notEqual(
    itemKey({ ...base, dedication: { forWhom: 'gift', message: 'Para Luz' } }),
    itemKey({ ...base, dedication: { forWhom: 'gift', message: 'Para Sol' } }),
  )
})

test('normalización de enfoque y dedicatoria', () => {
  assert.equal(normalizeFocus('amor', 'pareja'), 'pareja')
  assert.equal(normalizeFocus('amor', 'dinero'), 'bruja', 'un enfoque de otra intención no es válido')
  assert.deepEqual(normalizeDedication({ forWhom: 'me', message: 'hola' }), { forWhom: 'me', message: '' })
  assert.equal(normalizeDedication({ forWhom: 'gift', message: 'x'.repeat(300) }).message.length, 200)
})

test('el envío queda por cotizar mientras no haya tarifas reales', () => {
  const small = [{ intention: 'amor', size: 'aprendiz', extras: [], quantity: 1 }]
  const t = cartTotals(small)
  assert.equal(t.subtotal, PRICES.sizes.aprendiz)
  assert.equal(t.shipping.tier, 'pequeno')
  assert.equal(t.shipping.pending, true)
  assert.equal(t.total, t.subtotal, 'el envío pendiente no se suma')

  assert.equal(cartTotals([{ ...small[0], size: 'hechicera' }]).shipping.tier, 'mediano')
  const big = [{ intention: 'amor', size: 'gran_bruja', extras: [], quantity: 2 }]
  assert.equal(cartTotals(big).shipping.tier, 'grande')
  assert.equal(cartTotals(big).count, 2)
  assert.equal(cartTotals([]).shipping.tier, null)
})

test('formato de precio en pesos', () => {
  assert.match(formatPrice(389), /^\$389 MXN$/)
  assert.equal(formatPrice(null), '—')
})
