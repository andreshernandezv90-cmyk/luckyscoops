import { BRAND, contactLinks } from '../config/brand.js'
import { getExtra } from '../data/extras.js'
import { getFocus, getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { cartTotals, itemUnitPrice } from './pricing.js'
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

export function createOrderNumber(date = new Date()) {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${BRAND.orderPrefix}-${mmdd}-${random}`
}

/**
 * Registra el pedido.
 *
 * PUNTO DE INTEGRACIÓN: hoy el pedido se guarda solo en el navegador y la
 * persona lo envía por WhatsApp (ver `orderMessage`). Para recibir pedidos
 * automáticamente o cobrar en línea, reemplaza el cuerpo de esta función por
 * la llamada a tu backend o pasarela (Mercado Pago, Stripe…).
 */
export async function submitOrder({ items, customer, deliveryMethod, paymentMethod }) {
  await new Promise((resolve) => setTimeout(resolve, 700))
  return {
    number: createOrderNumber(),
    createdAt: new Date().toISOString(),
    items: items.map((item) => ({ ...item, unitPrice: itemUnitPrice(item) })),
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
    lines.push(`  Enfoque: ${getFocus(item.intention, item.focus)?.name ?? 'Déjalo en manos de la Bruja Sabia'}`)
    lines.push(`  Tamaño: ${getSize(item.size)?.name ?? ''}`)
    if (item.extras.length) lines.push(`  Extras: ${item.extras.map((e) => getExtra(e)?.name).join(', ')}`)
    if (item.dedication?.forWhom === 'gift') {
      lines.push(`  Es un regalo${item.dedication.message ? `. Dedicatoria: "${item.dedication.message}"` : ''}`)
    }
  }
  lines.push('', `Subtotal: ${formatPrice(order.totals.subtotal)}`)
  lines.push(`Envío: ${order.totals.shipping.pending ? `por cotizar (${order.totals.shipping.label})` : formatPrice(order.totals.shipping.price)}`)
  const c = order.customer
  lines.push('', `Nombre: ${c.name}`, `Teléfono: ${c.phone}`)
  if (c.address) lines.push(`Dirección: ${c.address.street}, ${c.address.neighborhood}, ${c.address.city}, ${c.address.state}, C.P. ${c.address.zip}`)
  const pay = PAYMENT_METHODS.find((p) => p.id === order.paymentMethod)
  if (pay) lines.push(`Forma de pago preferida: ${pay.name}`)
  if (c.notes) lines.push(`Notas: ${c.notes}`)
  return lines.join('\n')
}

/** Enlace de WhatsApp con el pedido escrito, o null si aún no hay número configurado. */
export const orderWhatsappLink = (order) => contactLinks(orderMessage(order)).whatsapp
