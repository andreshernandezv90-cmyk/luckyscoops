import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BRAND } from '../src/config/brand.js'
import { SHOW_PENDING } from '../src/config/env.js'
import { createOrderNumber, FIELD_MAX, orderMessage, orderWhatsappLink, whatsappReady } from '../src/lib/order.js'
import { local } from '../src/lib/storage.js'

const ORDER = {
  number: 'BS-1016-K7Q2XM',
  items: [
    {
      name: 'Scoop Hechicera del Amor',
      intention: 'amor',
      focus: 'bruja',
      size: 'hechicera',
      extras: ['cristal'],
      dedication: { forWhom: 'gift', message: 'Feliz cumple' },
      quantity: 1,
      unitPrice: 308,
    },
  ],
  totals: { subtotal: 308, shipping: { pending: true, label: 'Envío mediano', price: null } },
  customer: {
    name: 'Ana Prueba',
    phone: '5512345678',
    email: 'ana@example.com',
    notes: '',
    address: { street: 'Calle 1', neighborhood: 'Centro', city: 'CDMX', state: 'CDMX', zip: '01000' },
  },
  paymentMethod: 'transferencia',
}

/** Número de prueba: solo existe dentro de este test, nunca en la configuración. */
function withWhatsapp(number, fn) {
  const before = BRAND.contact.whatsapp
  BRAND.contact.whatsapp = number
  try {
    fn()
  } finally {
    BRAND.contact.whatsapp = before
  }
}

test('el número de pedido lleva prefijo, fecha y 6 caracteres sin ambigüedades', () => {
  const number = createOrderNumber(new Date(2026, 9, 16))
  assert.match(number, /^BS-1016-[2-9A-HJKMNP-Z]{6}$/)
})

test('los números de pedido no se repiten', () => {
  const numbers = new Set(Array.from({ length: 2000 }, () => createOrderNumber()))
  assert.equal(numbers.size, 2000)
})

test('el mensaje de WhatsApp incluye el pedido completo y el correo', () => {
  const text = orderMessage(ORDER)
  assert.match(text, /BS-1016-K7Q2XM/)
  assert.match(text, /Tamaño: Hechicera/)
  assert.match(text, /Extras: Cristal sorpresa/)
  assert.match(text, /Dedicatoria: "Feliz cumple"/)
  assert.match(text, /Correo: ana@example\.com/)
  assert.match(text, /C\.P\. 01000/)
  assert.match(text, /Envío: por cotizar/)
})

test('sin número de WhatsApp no hay enlace ni se da por listo', () => {
  withWhatsapp(null, () => {
    assert.equal(whatsappReady(), false)
    assert.equal(orderWhatsappLink(ORDER), null)
  })
})

test('con número, el enlace lleva el mensaje del pedido', () => {
  withWhatsapp('5215500000000', () => {
    assert.equal(whatsappReady(), true)
    const link = new URL(orderWhatsappLink(ORDER))
    assert.equal(link.origin + link.pathname, 'https://wa.me/5215500000000')
    assert.equal(link.searchParams.get('text'), orderMessage(ORDER))
  })
})

test('con todos los campos al máximo, el enlace de WhatsApp sigue siendo manejable', () => {
  const long = (n) => 'ñ'.repeat(n)
  const order = {
    ...ORDER,
    customer: {
      name: long(FIELD_MAX.name),
      phone: '1'.repeat(FIELD_MAX.phone),
      email: long(FIELD_MAX.email),
      notes: long(FIELD_MAX.notes),
      address: {
        street: long(FIELD_MAX.street),
        neighborhood: long(FIELD_MAX.neighborhood),
        city: long(FIELD_MAX.city),
        state: long(FIELD_MAX.state),
        zip: '01000',
      },
    },
  }
  withWhatsapp('5215500000000', () => {
    assert.ok(orderWhatsappLink(order).length < 8000)
  })
})

test('las marcas PENDIENTE no se muestran fuera de desarrollo', () => {
  assert.equal(SHOW_PENDING, false)
})

test('el almacenamiento puede borrar una clave y nunca falla', () => {
  const data = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (k) => (data.has(k) ? data.get(k) : null),
      setItem: (k, v) => data.set(k, v),
      removeItem: (k) => data.delete(k),
    },
  }
  try {
    local.write('bs-last-order-v1', { customer: { name: 'Ana' } })
    local.remove('bs-last-order-v1')
    assert.equal(local.read('bs-last-order-v1', null), null)
    globalThis.window = {}
    assert.doesNotThrow(() => local.remove('bs-last-order-v1'))
  } finally {
    delete globalThis.window
  }
})
