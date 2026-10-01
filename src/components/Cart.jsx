import { useState } from 'react'
import { BRAND } from '../config/brand.js'
import { getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { linkTo, ROUTES } from '../lib/router.js'
import { useShop } from '../state/ShopContext.jsx'
import { ItemDetails, OrderTotals } from './OrderSummary.jsx'
import { QuantityStepper } from './QuantityStepper.jsx'
import { PotionBottle } from './illustrations/PotionBottle.jsx'
import { ChapterDivider, TrashIcon } from './illustrations/Ornaments.jsx'
import { Cauldron } from './Cauldron.jsx'

/** "Tu encargo mágico": un carrito normal con un poco de tinta y lacre. */
export function Cart() {
  const { cart, totals, actions } = useShop()
  const [announcement, setAnnouncement] = useState('')

  if (cart.length === 0) {
    return (
      <section className="page page--narrow empty-cart" aria-labelledby="cart-title">
        <svg className="empty-cart__art" viewBox="40 60 320 330" aria-hidden="true" focusable="false">
          <Cauldron liquid={{}} activity="idle" spoon="stir" />
        </svg>
        <h1 id="cart-title" className="page__title">Tu caldero está vacío</h1>
        <p className="page__lead">{announcement || `Aún no has agregado ninguna ${BRAND.productNoun} a tu encargo.`}</p>
        <div className="page__actions">
          <a className="btn btn--primary btn--lg" {...linkTo(ROUTES.grimorio)}>
            Prepara tu {BRAND.productNoun}
          </a>
          <a className="btn btn--ghost" {...linkTo(ROUTES.productos)}>
            Ver {BRAND.productNounPlural} preparadas
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="page" aria-labelledby="cart-title">
      <header className="page__header">
        <p className="page__kicker">Carrito</p>
        <h1 id="cart-title" className="page__title">Tu encargo mágico</h1>
        <p className="page__lead">Revisa tu pedido. Puedes cambiar cantidades o quitar productos antes de pagar.</p>
        <ChapterDivider className="page__divider" />
      </header>

      <div className="cart">
        <ul className="cart__items" aria-label="Productos en tu encargo">
          {cart.map((item) => {
            const intention = getIntention(item.intention)
            const size = getSize(item.size)
            return (
              <li key={item.key} className="cart-item">
                <div className="cart-item__art" aria-hidden="true">
                  <PotionBottle color={intention.colors.liquid} deep={intention.colors.deep} glow={intention.colors.glow} fill={size.fill} />
                </div>
                <div className="cart-item__body">
                  <h2 className="cart-item__name">{item.name}</h2>
                  <p className="cart-item__tag">{item.productId ? `${BRAND.productNoun} preparada` : 'Preparada en el grimorio'}</p>
                  <ItemDetails
                    item={item}
                    compact
                    quantitySlot={
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => actions.updateQuantity(item.key, q)}
                        label={`Cantidad de ${item.name}`}
                      />
                    }
                  />
                  <button
                    type="button"
                    className="btn btn--text cart-item__remove"
                    onClick={() => {
                      actions.removeItem(item.key)
                      setAnnouncement(`Se quitó ${item.name} de tu encargo.`)
                    }}
                  >
                    <TrashIcon className="btn__icon" /> Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        <aside className="cart__summary parchment-panel" aria-labelledby="cart-summary-title">
          <h2 id="cart-summary-title" className="panel-title">Resumen del pedido</h2>
          <OrderTotals totals={totals} />
          <div className="cart__actions">
            <a className="btn btn--primary btn--lg btn--block" {...linkTo(ROUTES.pago)}>
              Finalizar compra
            </a>
            <a className="btn btn--ghost-ink btn--block" {...linkTo(ROUTES.productos)}>
              Continuar comprando
            </a>
          </div>
          <p className="cart__note">Pagas con transferencia, tarjeta (enlace seguro) o en efectivo en OXXO.</p>
        </aside>
      </div>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </section>
  )
}
