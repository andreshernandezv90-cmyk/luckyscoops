import { BRAND } from '../config/brand.js'
import { getFocus, getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { getExtra } from '../data/extras.js'
import { PRICES } from '../data/prices.js'
import { formatExtraPrice, formatPrice } from '../lib/format.js'
import { itemUnitPrice } from '../lib/pricing.js'

/** Texto corto de la dedicatoria para resúmenes. */
export function dedicationLabel(dedication) {
  if (dedication?.forWhom !== 'gift') return 'No (es para mí)'
  return dedication.message ? 'Incluida' : 'Es un regalo, sin dedicatoria'
}

/**
 * Información comercial clara, sin adornos que estorben:
 * producto · intención · enfoque · tamaño · extras · dedicatoria · precio · cantidad · subtotal.
 */
export function ItemDetails({
  item,
  unitPrice = itemUnitPrice(item),
  quantitySlot = null,
  compact = false,
  totalLabel = 'Subtotal',
  showMessage = false,
}) {
  const intention = getIntention(item.intention)
  const focus = getFocus(item.intention, item.focus)
  const size = getSize(item.size)
  const extras = item.extras.map(getExtra).filter(Boolean)
  const gift = item.dedication?.forWhom === 'gift'
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
        <dt>Enfoque</dt>
        <dd>{focus?.name ?? 'En manos de la Bruja Sabia'}</dd>
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
                  {e.name} <span className="summary-list__muted">{formatExtraPrice(e.price)}</span>
                </span>
              ))}
        </dd>
      </div>
      <div>
        <dt>Dedicatoria</dt>
        <dd>
          {dedicationLabel(item.dedication)}
          {showMessage && gift && item.dedication.message && (
            <span className="summary-list__message">“{item.dedication.message}”</span>
          )}
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
        <dt>{totalLabel}</dt>
        <dd>{formatPrice(unitPrice * item.quantity)}</dd>
      </div>
    </dl>
  )
}

/** Subtotal, envío y total. Mientras la tarifa de envío esté pendiente se muestra "por cotizar". */
export function OrderTotals({ totals }) {
  const { shipping } = totals
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
          <dt>
            Envío
            {shipping.label && <span className="order-totals__tier">{shipping.label}</span>}
          </dt>
          <dd>{shipping.pending ? 'Por cotizar' : shipping.price === 0 ? 'Gratis' : formatPrice(shipping.price)}</dd>
        </div>
        <div className="order-totals__total">
          <dt>{shipping.pending ? 'Total sin envío' : 'Total'}</dt>
          <dd>{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      {shipping.pending && (
        <p className="order-totals__note">
          Enviamos a toda la República Mexicana. El costo de envío depende del tamaño, el peso, las dimensiones y el
          destino, y se confirma contigo antes de pagar.
        </p>
      )}
      {PRICES.areDemo && <p className="demo-note">Precios de demostración (pendiente de precios reales).</p>}
    </div>
  )
}
