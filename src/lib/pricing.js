import { BRAND } from '../config/brand.js'
import { PRICES } from '../data/prices.js'
import { getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { EXTRAS, getExtra } from '../data/extras.js'
import { getProduct } from '../data/products.js'

/** Ordena los extras igual que en el catálogo y descarta los desconocidos o repetidos. */
export function normalizeExtras(extras = []) {
  const wanted = new Set(extras)
  return EXTRAS.filter((e) => wanted.has(e.id)).map((e) => e.id)
}

/**
 * Desglose del precio de una configuración.
 * Devuelve `unit: null` mientras no haya tamaño elegido (aún no hay precio).
 */
export function priceBreakdown({ intention, size, extras = [] } = {}) {
  const sizeData = getSize(size)
  const intentionData = getIntention(intention)
  const extrasData = normalizeExtras(extras).map(getExtra)
  const base = sizeData ? sizeData.price : null
  const intentionAdjustment = intentionData ? intentionData.priceAdjustment : 0
  const extrasTotal = extrasData.reduce((sum, e) => sum + e.price, 0)
  return {
    base,
    intentionAdjustment,
    extras: extrasData.map(({ id, name, price }) => ({ id, name, price })),
    extrasTotal,
    unit: base === null ? null : base + intentionAdjustment + extrasTotal,
  }
}

/** precioBasePorTamaño + ajusteIntención + precioExtras */
export function calculateUnitPrice(config) {
  return priceBreakdown(config).unit
}

/** "Scoop Gran Bruja del Amor" */
export function productName({ intention, size } = {}) {
  const i = getIntention(intention)
  const s = getSize(size)
  if (!i && !s) return BRAND.productNoun
  return [BRAND.productNoun, s?.name, i?.of].filter(Boolean).join(' ')
}

/** Precio de una línea del carrito (personalizada o preparada). */
export function itemUnitPrice(item) {
  const unit = calculateUnitPrice(item)
  if (unit === null) return 0
  const discount = item.productId ? getProduct(item.productId)?.discount ?? 0 : 0
  return Math.max(0, unit - discount)
}

/** Clave estable para fusionar líneas idénticas en el carrito. */
export function itemKey({ productId = null, intention, size, extras = [] }) {
  return [productId ?? 'custom', intention, size, normalizeExtras(extras).join('+') || 'sin-extras'].join('|')
}

export function shippingCost(subtotal, deliveryMethod = 'envio') {
  if (deliveryMethod === 'recoger') return PRICES.shipping.pickup
  if (subtotal === 0) return 0
  return subtotal >= PRICES.shipping.freeFrom ? 0 : PRICES.shipping.standard
}

export function cartTotals(items = [], deliveryMethod = 'envio') {
  const subtotal = items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const shipping = shippingCost(subtotal, deliveryMethod)
  return {
    count,
    subtotal,
    shipping,
    total: subtotal + shipping,
    freeShippingRemaining: Math.max(0, PRICES.shipping.freeFrom - subtotal),
  }
}

/** Una línea es válida si su intención y su tamaño existen en el catálogo. */
export function isValidItem(item) {
  return Boolean(
    item &&
      getIntention(item.intention) &&
      getSize(item.size) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0,
  )
}
