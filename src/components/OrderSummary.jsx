import { BRAND } from '../config/brand.js'
import { getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { getExtra } from '../data/extras.js'
import { PRICES } from '../data/prices.js'
import { formatPrice } from '../lib/format.js'
import { itemUnitPrice } from '../lib/pricing.js'

/**
 * Información comercial clara, sin adornos que estorben:
 * producto · intención · tamaño · extras · cantidad · precio · subtotal.
 */
export function ItemDetails({ item, unitPrice = itemUnitPrice(item), quantitySlot = null, compact = false }) {
  const intention = getIntention(item.intention)
  const size = getSize(item.size)
  const extras = item.extras.map(getExtra).filter(Boolean)
  return (
    <dl className={`summary-list${compact ? ' summary-list--compact' : ''}`}>
      {!compact && (
        <div>
          <dt>Producto</dt>
          <dd>{item.name}</dd>
        </div>
      )}
      <div>
        <dt>Intención</dt>
        <dd>{intention?.name}</dd>
      </div>
      <div>
        <dt>Tamaño</dt>
        <dd>
          {size?.name} <span className="summary-list__muted">({size?.label})</span>
        </dd>
      </div>
      <div>
        <dt>Extras</dt>
        <dd>
          {extras.length === 0
            ? 'Sin extras'
            : extras.map((e) => (
                <span key={e.id} className="summary-list__extra">
                  {e.name} <span className="summary-list__muted">+{formatPrice(e.price)}</span>
                </span>
              ))}
        </dd>
      </div>
      <div>
        <dt>Precio por {BRAND.productNoun}</dt>
        <dd>{formatPrice(unitPrice)}</dd>
      </div>
      <div>
        <dt>Cantidad</dt>
        <dd>{quantitySlot ?? item.quantity}</dd>
      </div>
      <div className="summary-list__subtotal">
        <dt>Subtotal</dt>
        <dd>{formatPrice(unitPrice * item.quantity)}</dd>
      </div>
    </dl>
  )
}

/** Subtotal, envío y total. `deliveryMethod` null = el envío aún no se elige. */
export function OrderTotals({ totals, deliveryMethod = null }) {
  let shippingText
  if (deliveryMethod === 'recoger') shippingText = 'Gratis (recoges en el taller)'
  else if (deliveryMethod === 'envio') shippingText = totals.shipping === 0 ? 'Gratis' : formatPrice(totals.shipping)
  else shippingText = 'Se elige al finalizar'

  const total = deliveryMethod ? totals.total : totals.subtotal
  return (
    <div className="order-totals">
      <dl>
        <div>
          <dt>
            Subtotal ({totals.count} {totals.count === 1 ? 'pieza' : 'piezas'})
          </dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        <div>
          <dt>Envío</dt>
          <dd>{shippingText}</dd>
        </div>
        <div className="order-totals__total">
          <dt>Total{deliveryMethod ? '' : ' sin envío'}</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {deliveryMethod !== 'recoger' && totals.subtotal > 0 && totals.freeShippingRemaining > 0 && (
        <p className="order-totals__note">
          Te faltan {formatPrice(totals.freeShippingRemaining)} para el envío gratis (desde{' '}
          {formatPrice(PRICES.shipping.freeFrom)}).
        </p>
      )}
      {deliveryMethod !== 'recoger' && totals.subtotal > 0 && totals.freeShippingRemaining === 0 && (
        <p className="order-totals__note order-totals__note--good">Tu pedido tiene envío gratis.</p>
      )}
    </div>
  )
}
