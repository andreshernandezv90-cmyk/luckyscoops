import { BRAND } from '../config/brand.js'
import { getFocus, getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { EXTRAS, getExtra } from '../data/extras.js'
import { getProduct } from '../data/products.js'
import { estimateShipping } from './shipping.js'

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

/** "Gran Bruja del Amor": título corto de la receta. */
export function recipeTitle({ intention, size } = {}) {
  const i = getIntention(intention)
  const s = getSize(size)
  return [s?.name, i?.of].filter(Boolean).join(' ') || BRAND.productNoun
}

/** "Scoop Gran Bruja del Amor": nombre completo para el carrito. */
export function productName(config = {}) {
  const title = recipeTitle(config)
  return title === BRAND.productNoun ? title : `${BRAND.productNoun} ${title}`
}

/** Normaliza la dedicatoria: { forWhom: 'me' | 'gift', message }. */
export function normalizeDedication(dedication) {
  const forWhom = dedication?.forWhom === 'gift' ? 'gift' : 'me'
  const message = forWhom === 'gift' ? String(dedication?.message ?? '').trim().slice(0, 200) : ''
  return { forWhom, message }
}

/** Enfoque válido para la intención; si no hay, queda en manos de la Bruja Sabia. */
export function normalizeFocus(intention, focus) {
  return getFocus(intention, focus) ? focus : 'bruja'
}

/** Precio de una línea del carrito (personalizada o preparada). */
export function itemUnitPrice(item) {
  const unit = calculateUnitPrice(item)
  if (unit === null) return 0
  const discount = item.productId ? getProduct(item.productId)?.discount ?? 0 : 0
  return Math.max(0, unit - discount)
}

/** Clave estable para fusionar líneas idénticas en el carrito (incluye enfoque y dedicatoria). */
export function itemKey({ productId = null, intention, focus, size, extras = [], dedication }) {
  const d = normalizeDedication(dedication)
  return [
    productId ?? 'custom',
    intention,
    normalizeFocus(intention, focus),
    size,
    normalizeExtras(extras).join('+') || 'sin-extras',
    d.forWhom === 'gift' ? `regalo:${d.message}` : 'para-mi',
  ].join('|')
}

/**
 * Totales del carrito. El envío se suma solo cuando su tarifa ya existe;
 * mientras esté pendiente, `shipping.pending` es true y `total` = subtotal.
 */
export function cartTotals(items = [], options = {}) {
  const subtotal = items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const shipping = estimateShipping(items, options)
  return {
    count,
    subtotal,
    shipping,
    total: subtotal + (shipping.pending ? 0 : shipping.price),
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
