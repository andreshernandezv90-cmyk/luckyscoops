import { motion, useReducedMotion } from 'motion/react'
import { BRAND } from '../config/brand.js'
import { DELIVERY_METHODS, PAYMENT_METHODS } from '../lib/order.js'
import { formatPrice } from '../lib/format.js'
import { linkTo, ROUTES } from '../lib/router.js'
import { getExtra } from '../data/extras.js'
import { useShop } from '../state/ShopContext.jsx'
import { BookCover } from './BookCover.jsx'
import { WaxSeal } from './illustrations/Sigils.jsx'
import { ChapterDivider } from './illustrations/Ornaments.jsx'
import { OrderTotals } from './OrderSummary.jsx'

/** Pantalla final: el grimorio se cierra y se sella. */
export function OrderComplete() {
  const { lastOrder: order } = useShop()
  const reduce = useReducedMotion()

  if (!order) {
    return (
      <section className="page page--narrow" aria-labelledby="done-title">
        <h1 id="done-title" className="page__title">Aún no hay pedidos sellados</h1>
        <p className="page__lead">Cuando completes una compra, aquí verás tu número de pedido y las instrucciones.</p>
        <div className="page__actions">
          <a className="btn btn--primary btn--lg" {...linkTo(ROUTES.grimorio)}>Prepara tu {BRAND.productNoun}</a>
        </div>
      </section>
    )
  }

  const delivery = DELIVERY_METHODS.find((d) => d.id === order.deliveryMethod)
  const payment = PAYMENT_METHODS.find((p) => p.id === order.paymentMethod)
  const firstName = order.customer.name.split(' ')[0]

  return (
    <section className="page order-complete" aria-labelledby="done-title">
      <div className="order-complete__art" aria-hidden="true">
        <BookCover startOpen className="closed-book--small" />
        <motion.div
          className="order-complete__seal"
          initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -40 }}
          animate={{ scale: 1, opacity: 1, rotate: -12 }}
          transition={{ delay: reduce ? 0 : 0.95, duration: 0.4, ease: [0.3, 1.4, 0.5, 1] }}
        >
          <WaxSeal color="#7d1d3a" glyph="check" />
        </motion.div>
      </div>

      <header className="page__header page__header--center">
        <p className="page__kicker">Pedido {order.number}</p>
        <h1 id="done-title" className="page__title">Tu ritual está completo</h1>
        <p className="page__lead">
          Gracias, {firstName}. Tu pedido comenzará a prepararse. Guarda tu número de pedido: <strong>{order.number}</strong>
        </p>
        <ChapterDivider className="page__divider" />
      </header>

      <div className="order-complete__grid">
        <div className="parchment-panel">
          <h2 className="panel-title">Resumen</h2>
          <ul className="mini-summary">
            {order.items.map((item) => (
              <li key={item.key}>
                <span className="mini-summary__name">
                  {item.quantity} × {item.name}
                  {item.extras.length > 0 && (
                    <span className="mini-summary__extras">Con {item.extras.map((e) => getExtra(e)?.name).join(', ')}</span>
                  )}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <OrderTotals totals={order.totals} deliveryMethod={order.deliveryMethod} />
          <p className="order-complete__delivery">
            <strong>Entrega:</strong> {delivery?.name}
            {order.deliveryMethod === 'envio' && order.customer.address && (
              <>
                {' '}
                a {order.customer.address.street}, {order.customer.address.neighborhood}, {order.customer.address.city},{' '}
                {order.customer.address.state}, C.P. {order.customer.address.zip}
              </>
            )}
            {order.deliveryMethod === 'recoger' && <> en {BRAND.contact.pickupAddress}</>}
          </p>
        </div>

        <div className="parchment-panel">
          <h2 className="panel-title">Instrucciones importantes</h2>
          <p>
            <strong>Forma de pago:</strong> {payment?.name}
          </p>
          <PaymentSteps order={order} />
          <ul className="instructions">
            <li>Preparamos tu pedido en 1 a 2 días hábiles después de confirmar el pago.</li>
            <li>
              {order.deliveryMethod === 'envio'
                ? 'Te enviaremos la guía de rastreo por WhatsApp o correo.'
                : 'Te avisaremos por WhatsApp cuando esté listo para recoger.'}
            </li>
            <li>Menciona tu número de pedido {order.number} en cualquier mensaje.</li>
          </ul>
          <h2 className="panel-title panel-title--spaced">Contacto</h2>
          <p>
            WhatsApp:{' '}
            <a href={`https://wa.me/${BRAND.contact.whatsapp}?text=${encodeURIComponent(`Hola, mi pedido es ${order.number}.`)}`} target="_blank" rel="noreferrer">
              {BRAND.contact.whatsappDisplay}
            </a>
            <br />
            Correo: <a href={`mailto:${BRAND.contact.email}?subject=${encodeURIComponent(`Pedido ${order.number}`)}`}>{BRAND.contact.email}</a>
          </p>
        </div>
      </div>

      <div className="page__actions page__actions--center">
        <a className="btn btn--primary btn--lg" {...linkTo(ROUTES.grimorio)}>
          Preparar otra {BRAND.productNoun}
        </a>
        <a className="btn btn--ghost" {...linkTo(ROUTES.inicio)}>
          Volver al inicio
        </a>
      </div>
    </section>
  )
}

function PaymentSteps({ order }) {
  const total = formatPrice(order.totals.total)
  if (order.paymentMethod === 'transferencia') {
    return (
      <div className="payment-box">
        <p>Transfiere {total} a esta cuenta y envíanos tu comprobante por WhatsApp:</p>
        <dl>
          <div><dt>Banco</dt><dd>{BRAND.bank.bankName}</dd></div>
          <div><dt>Titular</dt><dd>{BRAND.bank.holder}</dd></div>
          <div><dt>CLABE</dt><dd>{BRAND.bank.clabe}</dd></div>
          <div><dt>Concepto</dt><dd>{order.number}</dd></div>
        </dl>
      </div>
    )
  }
  if (order.paymentMethod === 'tarjeta') {
    return (
      <div className="payment-box">
        <p>
          En menos de 24 horas te enviaremos un enlace de pago seguro por {total} a tu WhatsApp
          {order.customer.email ? ' y a tu correo' : ''}. Nunca te pediremos los datos de tu tarjeta por mensaje.
        </p>
      </div>
    )
  }
  return (
    <div className="payment-box">
      <p>En menos de 24 horas te enviaremos una referencia para pagar {total} en cualquier tienda OXXO.</p>
    </div>
  )
}
