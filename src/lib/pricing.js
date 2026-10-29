import { BRAND } from '../config/brand.js'
import { getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { EXTRAS, getExtra } from '../data/extras.js'
import { getProduct } from '../data/products.js'
import { estimateShipping } from './shipping.js'

/** Extras que el tamaño ya incluye sin costo (p. ej. la Carta natal con Gran Bruja). */
export const includedExtras = (size) => getSize(size)?.includedExtras ?? []

/**
 * Extras que se cobran: los del catálogo, en su orden, sin repetidos ni
 * desconocidos, y sin los que el tamaño ya incluye (nunca se cobran dos veces).
 */
export function normalizeExtras(extras = [], size = null) {
  const wanted = new Set(extras)
  const included = new Set(includedExtras(size))
  return EXTRAS.filter((e) => wanted.has(e.id) && !included.has(e.id)).map((e) => e.id)
}

/**
 * Todos los extras de una receta, para mostrarlos: los incluidos por el tamaño
 * (`included: true`, sin precio) y los que se cobran, en el orden del catálogo.
 */
export function recipeExtras({ size, extras = [] } = {}) {
  const included = new Set(includedExtras(size))
  const paid = new Set(normalizeExtras(extras, size))
  return EXTRAS.filter((e) => included.has(e.id) || paid.has(e.id)).map((e) =>
    included.has(e.id) ? { ...e, price: 0, included: true } : { ...e, included: false },
  )
}

/** ¿La receta lleva Carta natal (u otro extra que pide datos de nacimiento)? */
export const needsBirthData = (config) => recipeExtras(config).some((e) => e.needsBirthData)

/**
 * Desglose del precio de una configuración.
 * Devuelve `unit: null` mientras no haya tamaño elegido (aún no hay precio).
 * Un extra con precio pendiente (`price: null`) no se suma: queda en `pendingExtras`.
 */
export function priceBreakdown({ intention, size, extras = [] } = {}) {
  const sizeData = getSize(size)
  const intentionData = getIntention(intention)
  const extrasData = normalizeExtras(extras, size).map(getExtra)
  const base = sizeData ? sizeData.price : null
  const intentionAdjustment = intentionData ? intentionData.priceAdjustment : 0
  const extrasTotal = extrasData.reduce((sum, e) => sum + (e.price ?? 0), 0)
  return {
    base,
    intentionAdjustment,
    extras: extrasData.map(({ id, name, price }) => ({ id, name, price })),
    extrasTotal,
    pendingExtras: extrasData.filter((e) => e.price === null).map((e) => e.name),
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

/** Precio de una línea del carrito (del Grimorio o preparada). */
export function itemUnitPrice(item) {
  const unit = calculateUnitPrice(item)
  if (unit === null) return 0
  const discount = item.productId ? getProduct(item.productId)?.discount ?? 0 : 0
  return Math.max(0, unit - discount)
}

/** Clave estable para fusionar líneas idénticas en el carrito (incluye la dedicatoria). */
export function itemKey({ productId = null, intention, size, extras = [], dedication }) {
  const d = normalizeDedication(dedication)
  return [
    productId ?? 'custom',
    intention,
    size,
    normalizeExtras(extras, size).join('+') || 'sin-extras',
    d.forWhom === 'gift' ? `regalo:${d.message}` : 'para-mi',
  ].join('|')
}

/**
 * Totales del carrito. El envío se suma solo cuando su tarifa ya existe;
 * mientras esté pendiente, `shipping.pending` es true y `total` = subtotal.
 * `pendingExtras`: nombres de extras elegidos cuyo precio aún no se confirma (no sumados).
 */
export function cartTotals(items = [], options = {}) {
  const subtotal = items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const shipping = estimateShipping(items, options)
  const pendingExtras = [...new Set(items.flatMap((item) => priceBreakdown(item).pendingExtras))]
  return {
    count,
    subtotal,
    shipping,
    pendingExtras,
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
