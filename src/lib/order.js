import { BRAND, contactLinks } from '../config/brand.js'
import { getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { cartTotals, itemUnitPrice, needsBirthData, recipeExtras } from './pricing.js'
import { formatPrice } from './format.js'

/** Hoy solo existe el envío a domicilio. Agrega aquí otras formas cuando existan. */
export const DELIVERY_METHODS = [
  {
    id: 'envio',
    name: 'Envío a toda la República Mexicana',
    detail: 'El costo depende del tamaño, el peso, las dimensiones y el destino. Se confirma contigo antes de pagar.',
  },
]

/**
 * Formas de pago.
 * TODO / PENDIENTE: ninguna está configurada todavía (`ready: false`). La persona
 * indica su preferencia y la Bruja Sabia le confirma cómo pagar.
 */
export const PAYMENT_METHODS = [
  { id: 'tarjeta', name: 'Tarjeta de crédito o débito', detail: 'Pago con tarjeta mediante enlace seguro.', ready: false },
  { id: 'transferencia', name: 'Transferencia bancaria', detail: 'Te compartiremos los datos para transferir.', ready: false },
  { id: 'mercadopago', name: 'Mercado Pago', detail: 'Pago a través de Mercado Pago.', ready: false },
  { id: 'whatsapp', name: 'Acordar por WhatsApp', detail: 'Coordinamos el pago contigo por mensaje.', ready: false },
]

/**
 * Longitud máxima de cada dato del cliente. Mantiene el mensaje de WhatsApp
 * dentro de un tamaño que el enlace wa.me abre sin problemas.
 */
export const FIELD_MAX = {
  name: 80,
  phone: 20,
  email: 120,
  street: 120,
  neighborhood: 80,
  city: 80,
  state: 60,
  zip: 5,
  notes: 300,
  natalName: 100,
}

/**
 * Carta natal: una por cada pieza que la lleva (2 × Gran Bruja = 2 cartas).
 * Devuelve la lista de cartas que pide el carrito, en orden:
 * [{ id: 'clave#1', item, index, of }]. `id` identifica los campos del formulario.
 */
export function natalChartSlots(items = []) {
  return items.filter(needsBirthData).flatMap((item) =>
    Array.from({ length: item.quantity }, (_, i) => ({ id: `${item.key}#${i + 1}`, item, index: i + 1, of: item.quantity })),
  )
}

/** "2026-10-29" → Date local, o null si no es una fecha real (p. ej. 2026-02-31). */
function parseISODate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''))
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(y, mo - 1, d)
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d ? date : null
}

/** Fecha de hoy en formato del campo de fecha (AAAA-MM-DD), en la hora local. */
export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/** Fecha más antigua que se acepta para una fecha de nacimiento. */
export const MIN_BIRTH_DATE = '1900-01-01'

/** Errores de los datos de una Carta natal: { name?, birthDate? }. */
export function validateNatalChart({ name = '', birthDate = '' } = {}, now = new Date()) {
  const errors = {}
  if (!name.trim()) errors.name = 'Escribe el nombre completo de la persona para quien es la Carta natal.'
  const date = parseISODate(birthDate)
  if (!birthDate) errors.birthDate = 'Escribe la fecha de nacimiento.'
  else if (!date || birthDate < MIN_BIRTH_DATE) errors.birthDate = 'Revisa la fecha de nacimiento; no parece una fecha válida.'
  else if (birthDate > todayISO(now)) errors.birthDate = 'La fecha de nacimiento no puede ser posterior a hoy.'
  return errors
}

/** "1990-04-07" → "7 de abril de 1990" */
export function formatBirthDate(value) {
  const date = parseISODate(value)
  if (!date) return value
  return new Intl.DateTimeFormat(BRAND.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

/** Sin 0/O ni 1/I/L: se lee y se dicta sin confusiones. */
const ORDER_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

/** BS-1016-K7Q2XM: fecha (mmdd) + 6 caracteres aleatorios (~1 000 millones de combinaciones por día). */
export function createOrderNumber(date = new Date()) {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const bytes = new Uint8Array(6)
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes)
  else bytes.forEach((_, i) => (bytes[i] = Math.floor(Math.random() * 256)))
  const random = Array.from(bytes, (b) => ORDER_ALPHABET[b % ORDER_ALPHABET.length]).join('')
  return `${BRAND.orderPrefix}-${mmdd}-${random}`
}

/** ¿Ya existe un número de WhatsApp para recibir pedidos? (src/config/brand.js → contact.whatsapp) */
export const whatsappReady = () => Boolean(BRAND.contact.whatsapp)

/**
 * Registra el pedido.
 *
 * PUNTO DE INTEGRACIÓN: hoy el pedido se guarda solo en el navegador y la
 * persona lo envía por WhatsApp (ver `orderMessage`). Para recibir pedidos
 * automáticamente o cobrar en línea, reemplaza el cuerpo de esta función por
 * la llamada a tu backend o pasarela (Mercado Pago, Stripe…).
 */
export async function submitOrder({ items, customer, deliveryMethod, paymentMethod, natalCharts = {} }) {
  await new Promise((resolve) => setTimeout(resolve, 700))
  return {
    number: createOrderNumber(),
    createdAt: new Date().toISOString(),
    // Cada línea con Carta natal lleva los datos de sus cartas; las demás no llevan nada.
    items: items.map((item) => {
      const line = { ...item, unitPrice: itemUnitPrice(item) }
      if (!needsBirthData(item)) return line
      const charts = natalChartSlots([item]).map((slot) => {
        const data = natalCharts[slot.id] ?? {}
        return { name: String(data.name ?? '').trim(), birthDate: data.birthDate ?? '' }
      })
      return { ...line, natalCharts: charts }
    }),
    customer,
    deliveryMethod,
    paymentMethod,
    totals: cartTotals(items, { zip: customer?.address?.zip }),
  }
}

/** Texto del pedido para enviarlo por WhatsApp. */
export function orderMessage(order) {
  const lines = [`Hola, ${BRAND.witch}. Quiero confirmar mi pedido ${order.number}:`, '']
  for (const item of order.items) {
    lines.push(`• ${item.quantity} × ${item.name} — ${formatPrice(item.unitPrice * item.quantity)}`)
    lines.push(`  Intención: ${getIntention(item.intention)?.name ?? ''}`)
    lines.push(`  Tamaño: ${getSize(item.size)?.name ?? ''}`)
    const extras = recipeExtras(item)
    if (extras.length) {
      lines.push(`  Extras: ${extras.map((e) => (e.included ? `${e.name} (incluida con ${getSize(item.size)?.name})` : e.name)).join(', ')}`)
    }
    if (needsBirthData(item)) {
      const charts = item.natalCharts ?? []
      charts.forEach((chart, i) => {
        const label = charts.length > 1 ? `Carta natal ${i + 1}` : 'Carta natal'
        lines.push(`  ${label}: ${chart.name}, nacimiento ${formatBirthDate(chart.birthDate)}`)
      })
    }
    if (item.dedication?.forWhom === 'gift') {
      lines.push(`  Es un regalo${item.dedication.message ? `. Dedicatoria: "${item.dedication.message}"` : ''}`)
    }
  }
  lines.push('', `Subtotal: ${formatPrice(order.totals.subtotal)}`)
  if (order.totals.pendingExtras?.length) {
    lines.push(`Precio por confirmar (no incluido en el subtotal): ${order.totals.pendingExtras.join(', ')}`)
  }
  lines.push(`Envío: ${order.totals.shipping.pending ? `por cotizar (${order.totals.shipping.label})` : formatPrice(order.totals.shipping.price)}`)
  const c = order.customer
  lines.push('', `Nombre: ${c.name}`, `Teléfono: ${c.phone}`)
  if (c.email) lines.push(`Correo: ${c.email}`)
  if (c.address) lines.push(`Dirección: ${c.address.street}, ${c.address.neighborhood}, ${c.address.city}, ${c.address.state}, C.P. ${c.address.zip}`)
  const pay = PAYMENT_METHODS.find((p) => p.id === order.paymentMethod)
  if (pay) lines.push(`Forma de pago preferida: ${pay.name}`)
  if (c.notes) lines.push(`Notas: ${c.notes}`)
  return lines.join('\n')
}

/** Enlace de WhatsApp con el pedido escrito, o null si aún no hay número configurado. */
export const orderWhatsappLink = (order) => contactLinks(orderMessage(order)).whatsapp
