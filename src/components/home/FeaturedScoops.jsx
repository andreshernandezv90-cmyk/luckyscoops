import { useEffect, useState } from 'react'
import { BRAND } from '../../config/brand.js'
import { PRODUCTS } from '../../data/products.js'
import { getIntention } from '../../data/intentions.js'
import { getSize } from '../../data/sizes.js'
import { calculateUnitPrice, itemUnitPrice, recipeExtras } from '../../lib/pricing.js'
import { formatPrice } from '../../lib/format.js'
import { linkTo, navigate, ROUTES } from '../../lib/router.js'
import { CHAPTER, useShop } from '../../state/ShopContext.jsx'
import { PotionBottle } from '../illustrations/PotionBottle.jsx'
import { CheckMark } from '../illustrations/Ornaments.jsx'
import { SectionTitle } from './SectionTitle.jsx'

/** Scoops preparadas: compra directa en un clic, sin hacer el ritual. */
export function FeaturedScoops() {
  const { actions } = useShop()
  const [justAdded, setJustAdded] = useState(null)

  useEffect(() => {
    if (!justAdded) return undefined
    const t = setTimeout(() => setJustAdded(null), 5000)
    return () => clearTimeout(t)
  }, [justAdded])

  return (
    <section className="section" id="scoops" aria-labelledby="products-title">
      <SectionTitle id="products-title" kicker="Para quien tiene prisa">
        {BRAND.productNounPlural} preparadas
      </SectionTitle>
      {/* TODO / PENDIENTE: estas Scoops son ejemplos (src/data/products.js). */}
      <p className="section__lead">
        Recetas listas para agregar a tu pedido en un clic. Si quieres, ábrelas en el Grimorio y cambia lo que gustes.
      </p>
      <ul className="product-grid">
        {PRODUCTS.map((product) => {
          const intention = getIntention(product.intention)
          const size = getSize(product.size)
          const recipe = {
            productId: product.id,
            intention: product.intention,
            size: product.size,
            extras: product.extras,
          }
          const extras = recipeExtras(recipe)
          const price = itemUnitPrice(recipe)
          const fullPrice = calculateUnitPrice(recipe)
          const added = justAdded === product.id
          return (
            <li key={product.id} className="product-card" style={{ '--accent': intention.colors.liquid }}>
              <span className="product-card__badge">{product.badge}</span>
              <div className="product-card__art" aria-hidden="true">
                <PotionBottle color={intention.colors.liquid} deep={intention.colors.deep} glow={intention.colors.glow} shape={intention.bottle} fill={size.fill} />
              </div>
              <h3 className="product-card__name">
                {BRAND.productNoun} {product.name}
              </h3>
              <p className="product-card__recipe">
                {intention.name} · {size.name}
                {extras.length > 0 && ` · ${extras.map((e) => (e.included ? `${e.name} incluida` : e.name)).join(' · ')}`}
              </p>
              <p className="product-card__desc">{product.description}</p>
              <p className="product-card__price">
                {fullPrice !== price && (
                  <span className="product-card__old">
                    <span className="sr-only">Antes </span>
                    {formatPrice(fullPrice)}
                  </span>
                )}
                <strong>
                  {fullPrice !== price && <span className="sr-only">Ahora </span>}
                  {formatPrice(price)}
                </strong>
              </p>
              <div className="product-card__actions">
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={() => {
                    actions.addToCart({ ...recipe, name: `${BRAND.productNoun} ${product.name}`, quantity: 1 })
                    setJustAdded(product.id)
                  }}
                >
                  Agregar a mi pedido
                </button>
                <button
                  type="button"
                  className="btn btn--text"
                  onClick={() => {
                    actions.loadRecipe(product, CHAPTER.INGREDIENTES)
                    navigate(ROUTES.grimorio)
                  }}
                >
                  Ajustar en el Grimorio
                </button>
              </div>
              <p className="product-card__status" role="status">
                {added && (
                  <>
                    <CheckMark className="btn__icon" /> Agregada a tu pedido ·{' '}
                    <a {...linkTo(ROUTES.carrito)}>Ver mi pedido</a>
                  </>
                )}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
