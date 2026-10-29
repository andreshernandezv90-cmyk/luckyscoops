import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BRAND } from '../src/config/brand.js'
import { SHOW_PENDING } from '../src/config/env.js'
import {
  createOrderNumber,
  FIELD_MAX,
  natalChartSlots,
  orderMessage,
  orderWhatsappLink,
  submitOrder,
  validateNatalChart,
  whatsappReady,
} from '../src/lib/order.js'
import { cartTotals } from '../src/lib/pricing.js'
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

test('sin Carta natal el mensaje no pide ni lleva datos de nacimiento', () => {
  const text = orderMessage(ORDER)
  assert.doesNotMatch(text, /Carta natal|nacimiento/)
  assert.deepEqual(natalChartSlots(ORDER.items), [])
})

test('una Carta natal por pieza: 2 × Gran Bruja piden dos cartas', () => {
  const items = [
    { key: 'a', name: 'Scoop Gran Bruja del Amor', intention: 'amor', size: 'gran_bruja', extras: [], quantity: 2 },
    { key: 'b', name: 'Scoop Aprendiz del Amor', intention: 'amor', size: 'aprendiz', extras: [], quantity: 1 },
    { key: 'c', name: 'Scoop Hechicera del Amor', intention: 'amor', size: 'hechicera', extras: ['carta_natal'], quantity: 1 },
  ]
  assert.deepEqual(
    natalChartSlots(items).map((s) => s.id),
    ['a#1', 'a#2', 'c#1'],
  )
})

test('la Carta natal pide nombre y una fecha válida que no sea futura', () => {
  const now = new Date(2026, 9, 29)
  assert.deepEqual(validateNatalChart({ name: 'Luz Pérez', birthDate: '1990-04-07' }, now), {})
  assert.ok(validateNatalChart({ name: '  ', birthDate: '1990-04-07' }, now).name)
  assert.ok(validateNatalChart({ name: 'Luz', birthDate: '' }, now).birthDate)
  assert.ok(validateNatalChart({ name: 'Luz', birthDate: '1990-02-31' }, now).birthDate, 'fecha inexistente')
  assert.ok(validateNatalChart({ name: 'Luz', birthDate: '2026-10-30' }, now).birthDate, 'fecha futura')
  assert.deepEqual(validateNatalChart({ name: 'Luz', birthDate: '2026-10-29' }, now), {}, 'hoy es válido')
})

test('el pedido con Gran Bruja lleva la Carta natal incluida y sus datos', async () => {
  const items = [{ key: 'k', name: 'Scoop Gran Bruja del Amor', intention: 'amor', size: 'gran_bruja', extras: [], quantity: 1 }]
  const order = await submitOrder({
    items,
    customer: { name: 'Ana Prueba', phone: '5512345678', email: '', notes: '', address: null },
    paymentMethod: 'transferencia',
    natalCharts: { 'k#1': { name: ' Luz Pérez ', birthDate: '1990-04-07' } },
  })
  assert.deepEqual(order.items[0].natalCharts, [{ name: 'Luz Pérez', birthDate: '1990-04-07' }])
  assert.equal(order.totals.subtotal, cartTotals(items).subtotal, 'la carta incluida no suma')
  const text = orderMessage(order)
  assert.match(text, /Extras: Carta natal \(incluida con Gran Bruja\)/)
  assert.match(text, /Carta natal: Luz Pérez, nacimiento 7 de abril de 1990/)
  assert.doesNotMatch(text, /Precio por confirmar/)
})

test('la Carta natal como extra avisa que su precio está por confirmar', async () => {
  const items = [{ key: 'k', name: 'Scoop Hechicera del Amor', intention: 'amor', size: 'hechicera', extras: ['carta_natal'], quantity: 1 }]
  const order = await submitOrder({
    items,
    customer: { name: 'Ana Prueba', phone: '5512345678', email: '', notes: '', address: null },
    paymentMethod: 'transferencia',
    natalCharts: { 'k#1': { name: 'Sol Ruiz', birthDate: '2001-12-24' } },
  })
  const text = orderMessage(order)
  assert.match(text, /Extras: Carta natal\n/)
  assert.match(text, /Carta natal: Sol Ruiz, nacimiento 24 de diciembre de 2001/)
  assert.match(text, /Precio por confirmar \(no incluido en el subtotal\): Carta natal/)
})
