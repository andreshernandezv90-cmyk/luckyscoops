import { BRAND } from '../config/brand.js'
import { getIntention } from '../data/intentions.js'
import { PRICES } from '../data/prices.js'
import { SHOW_PENDING } from '../config/env.js'
import { getSize } from '../data/sizes.js'
import { priceBreakdown, recipeExtras } from '../lib/pricing.js'
import { formatExtraPrice, formatPrice } from '../lib/format.js'
import { useShop } from '../state/ShopContext.jsx'
import { ChapterDivider } from './illustrations/Ornaments.jsx'

/** Texto que se "escribe con tinta" cada vez que cambia su valor. */
function InkText({ value, placeholder = 'por elegir' }) {
  if (!value) return <span className="recipe__empty">{placeholder}</span>
  return (
    <span key={value} className="ink-write">
      {value}
    </span>
  )
}

/** La receta en curso, anotada a mano en la página izquierda del grimorio. */
export function RecipeCard() {
  const { builder, price } = useShop()
  const intention = getIntention(builder.intention)
  const size = getSize(builder.size)
  const extras = recipeExtras(builder)
  const { forWhom, message } = builder.dedication
  const breakdown = priceBreakdown(builder)

  return (
    <section className="recipe" aria-labelledby="recipe-title">
      <h3 id="recipe-title" className="recipe__title">
        Tu receta
      </h3>
      <ChapterDivider />
      <dl className="recipe__lines">
        <div className="recipe__line">
          <dt>Intención</dt>
          <dd>
            <InkText value={intention?.name} />
          </dd>
        </div>
        <div className="recipe__line">
          <dt>Tamaño</dt>
          <dd>
            <InkText value={size?.name} />
          </dd>
        </div>
        <div className="recipe__line recipe__line--extras">
          <dt>Ingredientes extra</dt>
          <dd>
            {extras.length === 0 ? (
              <span className="recipe__empty">ninguno por ahora</span>
            ) : (
              <ul>
                {extras.map((e) => (
                  <li key={e.id}>
                    <InkText value={e.name} />{' '}
                    <span className="recipe__extra-price">{e.included ? `Incluida con ${size.name}` : formatExtraPrice(e.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
        <div className="recipe__line">
          <dt>Regalo</dt>
          <dd>
            <InkText value={forWhom === 'gift' ? (message ? 'Sí, con dedicatoria' : 'Sí') : 'No, es para mí'} />
          </dd>
        </div>
      </dl>
      <div className="recipe__total">
        <span>Precio por {BRAND.productNoun}</span>
        <strong>{price === null ? 'Elige un tamaño' : formatPrice(price)}</strong>
      </div>
      {price !== null && (
        <p className="recipe__breakdown">
          {size.name} {formatPrice(breakdown.base)}
          {breakdown.intentionAdjustment !== 0 && ` · ${intention.name} ${formatPrice(breakdown.intentionAdjustment)}`}
          {breakdown.extrasTotal > 0 && ` + ingredientes ${formatPrice(breakdown.extrasTotal)}`}
          {breakdown.pendingExtras.length > 0 && ` + ${breakdown.pendingExtras.join(', ')} (precio por confirmar)`}
        </p>
      )}
      {SHOW_PENDING && PRICES.areDemo && <p className="demo-note">Precios de demostración (pendiente de precios reales).</p>}
    </section>
  )
}

/** Resumen corto de la receta para la barra fija del celular. */
export function recipeSummary(builder) {
  const parts = [getIntention(builder.intention)?.name, getSize(builder.size)?.name]
  const count = recipeExtras(builder).length
  if (count) parts.push(`${count} extra${count > 1 ? 's' : ''}`)
  return parts.filter(Boolean).join(' · ') || 'Tu receta está en blanco'
}
