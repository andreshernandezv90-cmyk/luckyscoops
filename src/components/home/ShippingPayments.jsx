import { PRICES } from '../../data/prices.js'
import { formatPrice } from '../../lib/format.js'
import { PAYMENT_METHODS } from '../../lib/order.js'
import { PendingTag } from '../PendingTag.jsx'
import { SectionTitle } from './SectionTitle.jsx'

/** Cómo recibes y cómo pagas tu pedido (sin tarifas ni métodos inventados). */
export function ShippingPayments() {
  const tiers = Object.values(PRICES.shipping.tiers)
  return (
    <section className="section" id="envios-y-pagos" aria-labelledby="shipping-title">
      <SectionTitle id="shipping-title" kicker="Antes de comprar">
        Envíos y formas de pago
      </SectionTitle>
      <div className="info-grid">
        <div className="parchment-panel">
          <h3 className="panel-title">Envíos a toda la República Mexicana</h3>
          <p>El costo depende del tamaño de tu Scoop, los productos, el peso, las dimensiones y el destino.</p>
          <ul className="tier-list">
            {tiers.map((tier) => (
              <li key={tier.label}>
                <span>{tier.label}</span>
                {tier.price === null ? <PendingTag>Tarifa por definir</PendingTag> : <strong>{formatPrice(tier.price)}</strong>}
              </li>
            ))}
          </ul>
          <p className="info-grid__note">Te confirmamos el costo exacto antes de pagar.</p>
        </div>
        <div className="parchment-panel">
          <h3 className="panel-title">Formas de pago</h3>
          <p>Estamos preparando estas opciones. Al registrar tu pedido te confirmamos cuál está disponible.</p>
          <ul className="tier-list">
            {PAYMENT_METHODS.map((m) => (
              <li key={m.id}>
                <span>{m.name}</span>
                {!m.ready && <PendingTag>Próximamente</PendingTag>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
