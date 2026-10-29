import { BRAND } from '../config/brand.js'

const money = new Intl.NumberFormat(BRAND.locale, {
  style: 'currency',
  currency: BRAND.currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** 389 → "$389 MXN" */
export function formatPrice(amount) {
  if (amount === null || amount === undefined) return '—'
  return `${money.format(amount)} ${BRAND.currency}`
}

/** Lista legible: ["a", "b", "c"] → "a, b y c" */
export function formatList(items) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

/** Precio de un extra: "+$59 MXN", "Sin costo" o, si aún no existe, "Precio por confirmar". */
export function formatExtraPrice(amount) {
  if (amount === null || amount === undefined) return 'Precio por confirmar'
  return amount === 0 ? 'Sin costo' : `+${formatPrice(amount)}`
}
