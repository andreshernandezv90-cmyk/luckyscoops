import { BRAND } from '../config/brand.js'
import { cartTotals, itemUnitPrice } from './pricing.js'

export const DELIVERY_METHODS = [
  { id: 'envio', name: 'Envío a domicilio', detail: 'De 3 a 6 días hábiles a todo México.' },
  { id: 'recoger', name: 'Recoger en el taller', detail: `Sin costo. ${BRAND.contact.pickupAddress}.` },
]

export const PAYMENT_METHODS = [
  {
    id: 'transferencia',
    name: 'Transferencia bancaria',
    detail: 'Te mostramos la CLABE al confirmar.',
  },
  {
    id: 'tarjeta',
    name: 'Tarjeta de crédito o débito',
    detail: 'Te enviamos un enlace de pago seguro por WhatsApp o correo.',
  },
  {
    id: 'oxxo',
    name: 'Efectivo en OXXO',
    detail: 'Te enviamos una referencia para pagar en tienda.',
  },
]

export function createOrderNumber(date = new Date()) {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${BRAND.orderPrefix}-${mmdd}-${random}`
}

/**
 * Registra el pedido.
 *
 * PUNTO DE INTEGRACIÓN: hoy el pedido se confirma localmente y el pago se
 * coordina después (transferencia, enlace de pago o referencia OXXO). Para
 * cobrar en línea, reemplaza el cuerpo de esta función por la llamada a tu
 * backend o pasarela (Mercado Pago, Stripe, Conekta…) y devuelve el pedido
 * confirmado o lanza un error con un mensaje para la persona.
 */
export async function submitOrder({ items, customer, deliveryMethod, paymentMethod }) {
  await new Promise((resolve) => setTimeout(resolve, 900))
  const totals = cartTotals(items, deliveryMethod)
  return {
    number: createOrderNumber(),
    createdAt: new Date().toISOString(),
    items: items.map((item) => ({ ...item, unitPrice: itemUnitPrice(item) })),
    customer,
    deliveryMethod,
    paymentMethod,
    totals,
  }
}
