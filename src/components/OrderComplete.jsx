import { motion, useReducedMotion } from 'motion/react'
import { BRAND } from '../config/brand.js'
import { DELIVERY_METHODS, orderWhatsappLink, PAYMENT_METHODS } from '../lib/order.js'
import { formatPrice } from '../lib/format.js'
import { linkTo, ROUTES } from '../lib/router.js'
import { getExtra } from '../data/extras.js'
import { getFocus } from '../data/intentions.js'
import { useShop } from '../state/ShopContext.jsx'
import { BookCover } from './BookCover.jsx'
import { WaxSeal } from './illustrations/Sigils.jsx'
import { ChapterDivider } from './illustrations/Ornaments.jsx'
import { OrderTotals } from './OrderSummary.jsx'
import { PendingTag } from './PendingTag.jsx'

/**
 * Pantalla final. Con WhatsApp configurado, el Grimorio se cierra y se sella, y
 * falta que la persona envíe el pedido. Sin WhatsApp no hay cierre ni sello: es
 * un resumen pendiente, porque el pedido no le llega a nadie.
 */
export function OrderComplete() {
  const { lastOrder: order } = useShop()
  const reduce = useReducedMotion()

  if (!order) {
    return (
      <section className="page page--narrow" aria-labelledby="done-title">
        <h1 id="done-title" className="page__title">Aún no hay pedidos sellados</h1>
        <p className="page__lead">Cuando registres un pedido, aquí verás tu número de pedido y los siguientes pasos.</p>
        <div className="page__actions">
          <a className="btn btn--primary btn--lg" {...linkTo(ROUTES.grimorio)}>Abrir el Grimorio</a>
        </div>
      </section>
    )
  }

  const delivery = DELIVERY_METHODS.find((d) => d.id === order.deliveryMethod)
  const payment = PAYMENT_METHODS.find((p) => p.id === order.paymentMethod)
  const firstName = order.customer.name.split(' ')[0]
  const whatsapp = orderWhatsappLink(order)

  return (
    <section className="page order-complete" aria-labelledby="done-title">
      {whatsapp ? (
        <div className="order-complete__art" aria-hidden="true">
          <BookCover startOpen className="closed-book--small" />
          {/* Cuando la tapa termina de caer, el sello con la marca se estampa sobre el libro */}
          <motion.div
            className="order-complete__seal"
            initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -40 }}
            animate={reduce ? { opacity: 1, rotate: -12 } : { scale: [2.2, 0.88, 1.04, 1], opacity: 1, rotate: -12 }}
            transition={{ delay: reduce ? 0 : 1.2, duration: 0.45, times: [0, 0.55, 0.8, 1], ease: 'easeOut' }}
          >
            <WaxSeal color="#b0306f" glyph={BRAND.logoMark ? 'brand' : 'check'} />
          </motion.div>
        </div>
      ) : null}

      <header className="page__header page__header--center">
        <p className="page__kicker">Pedido {order.number}</p>
        <h1 id="done-title" className="page__title">
          {whatsapp ? 'Falta un paso: envía tu pedido' : 'Tu pedido todavía no ha sido enviado'}
        </h1>
        {whatsapp ? (
          <p className="page__lead">
            {firstName}, tu pedido <strong>{order.number}</strong>{' '}
            <strong>todavía no le llega a {BRAND.witch}</strong>: envíalo por WhatsApp para confirmar el envío y la
            forma de pago. Después comenzará a prepararse.
          </p>
        ) : (
          <>
            <p className="page__lead">
              {firstName}, tu pedido <strong>{order.number}</strong>{' '}
              <strong>no ha sido enviado ni recibido por {BRAND.witch}</strong>. El envío por WhatsApp todavía no
              está disponible.
            </p>
            {/* Estado neutral: sin cierre ni sello, solo el número para guardarlo */}
            <div className="order-pending" role="status">
              <p className="order-pending__label">Resumen pendiente de envío</p>
              <p className="order-pending__number">{order.number}</p>
              <p className="order-pending__note">Guarda este número y el resumen de abajo.</p>
            </div>
          </>
        )}
        <div className="page__actions">
          {whatsapp ? (
            <a className="btn btn--primary btn--xl" href={whatsapp} target="_blank" rel="noreferrer">
              Enviar mi pedido por WhatsApp
            </a>
          ) : (
            <PendingTag>Falta configurar el número de WhatsApp</PendingTag>
          )}
        </div>
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
                  <span className="mini-summary__extras">
                    Enfoque: {getFocus(item.intention, item.focus)?.name ?? 'En manos de la Bruja Sabia'}
                  </span>
                  {item.extras.length > 0 && (
                    <span className="mini-summary__extras">Con {item.extras.map((e) => getExtra(e)?.name).join(', ')}</span>
                  )}
                  {item.dedication?.forWhom === 'gift' && (
                    <span className="mini-summary__extras">
                      Regalo{item.dedication.message ? `. Dedicatoria: “${item.dedication.message}”` : ''}
                    </span>
                  )}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <OrderTotals totals={order.totals} />
          {order.customer.address && (
            <p className="order-complete__delivery">
              <strong>{delivery?.name}:</strong> {order.customer.address.street}, {order.customer.address.neighborhood},{' '}
              {order.customer.address.city}, {order.customer.address.state}, C.P. {order.customer.address.zip}
            </p>
          )}
        </div>

        <div className="parchment-panel">
          <h2 className="panel-title">Siguientes pasos</h2>
          <ul className="instructions">
            <li>
              {whatsapp
                ? `Envía tu pedido por WhatsApp para que ${BRAND.witch} lo reciba.`
                : `Tu pedido todavía no ha sido enviado ni recibido por ${BRAND.witch}; guarda tu número de pedido.`}
            </li>
            <li>Te confirmaremos el costo de envío ({order.totals.shipping.label?.toLowerCase()}) según tu destino.</li>
            <li>
              Te indicaremos cómo pagar. Forma de pago preferida: <strong>{payment?.name}</strong>.
            </li>
            <li>Cuando se confirme el pago, tu {BRAND.productNoun} comenzará a prepararse.</li>
            <li>Menciona tu número de pedido {order.number} en cualquier mensaje.</li>
          </ul>
          <p className="order-complete__note">Nunca te pediremos los datos de tu tarjeta por mensaje.</p>
        </div>
      </div>

      <div className="page__actions page__actions--center">
        <a className="btn btn--ghost" {...linkTo(ROUTES.grimorio)}>
          Preparar otra {BRAND.productNoun}
        </a>
        <a className="btn btn--ghost" {...linkTo(ROUTES.inicio)}>
          Volver al inicio
        </a>
      </div>
    </section>
  )
}
