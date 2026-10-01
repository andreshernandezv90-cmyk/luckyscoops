import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BRAND, brandSingular } from '../config/brand.js'
import { getIntention } from '../data/intentions.js'
import { buildRitual, liquidFor, scoopColors } from '../lib/ritual.js'
import { formatPrice } from '../lib/format.js'
import { linkTo } from '../lib/router.js'
import { useSequence } from '../hooks/useSequence.js'
import { CHAPTER, useShop } from '../state/ShopContext.jsx'
import { Cauldron } from './Cauldron.jsx'
import { MagicCircle } from './RitualAnimation.jsx'
import { ParticleBurst } from './ParticleBurst.jsx'
import { ItemDetails } from './OrderSummary.jsx'
import { QuantityStepper } from './QuantityStepper.jsx'
import { ChapterHeading } from './ChapterHeading.jsx'
import { WaxSeal } from './illustrations/Sigils.jsx'
import { CheckMark } from './illustrations/Ornaments.jsx'

const REVEAL_STEPS = [
  { phase: 'dim', duration: 350 },
  { phase: 'dip', duration: 650 },
  { phase: 'lift', duration: 950 },
]

/**
 * Capítulo V: la cuchara entra al caldero y sale con la Scoop.
 * Después se muestra el resultado con toda la información de compra.
 */
export function Revelation({ autoFocus }) {
  const { builder, price, total, name, actions, addBuilderToCart } = useShop()
  const reduce = useReducedMotion()
  const ritual = useMemo(
    () => buildRitual(builder),
    [builder.intention, builder.size, builder.extras.join('+')],
  )
  const liquid = useMemo(() => liquidFor(ritual, new Set(ritual.items.map((_, i) => i))), [ritual])
  const seq = useSequence(REVEAL_STEPS, { startFinished: reduce })
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!reduce) seq.start()
    // Arranca una sola vez al abrir el capítulo.
  }, [])

  const phase = seq.finished ? 'reveal' : seq.step?.phase ?? 'dim'
  const spoon = phase === 'dip' ? 'dip' : phase === 'lift' || phase === 'reveal' ? 'lift' : 'rest'
  const showScoop = phase === 'lift' || phase === 'reveal'

  return (
    <div className={`revelation is-${phase}`}>
      <div className="revelation__stage">
        <motion.div
          className="revelation__dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.35 }}
          aria-hidden="true"
        />
        <svg viewBox="0 0 400 400" role="img" aria-label={`El caldero burbujea y la cuchara sostiene tu ${name}.`}>
          <MagicCircle spinning={!reduce} />
          <Cauldron liquid={liquid} activity="boil" spoon={spoon} scoop={showScoop ? scoopColors(ritual) : null} />
          {phase === 'reveal' && (
            <ParticleBurst
              cx={190}
              cy={96}
              count={20}
              spread={110}
              rise={40}
              scale={1.5}
              effect={getIntention(builder.intention)?.effect ?? 'sparkles'}
              colors={ritual.items.map((i) => i.glow).concat('#fff4d6')}
            />
          )}
        </svg>
        {!seq.finished && (
          <button type="button" className="btn btn--text btn--on-dark revelation__skip" onClick={seq.skip}>
            Saltar animación
          </button>
        )}
      </div>

      <div className="revelation__result">
        <p className="chapter-intro__kicker">Capítulo V · Revelación</p>
        <ChapterHeading autoFocus={autoFocus} className={seq.finished ? 'revelation__title' : 'revelation__heading'}>
          {seq.finished ? `Tu ${brandSingular()} ha sido invocada` : 'La cuchara entra al caldero…'}
        </ChapterHeading>
        <p className="sr-only" role="status">
          {seq.finished ? `Tu ${brandSingular()} ha sido invocada: ${name}, ${formatPrice(price)} cada una.` : ''}
        </p>

        <AnimatePresence>
          {seq.finished && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              {added ? (
                <div className="result-card result-card--added" role="status">
                  <WaxSeal className="result-card__seal" color="#1f5a36" glyph="check" />
                  <h3 className="result-card__name">¡Listo! Tu {BRAND.productNoun} está en tu encargo</h3>
                  <p className="result-card__text">
                    {builder.quantity} × {name} · {formatPrice(total)}
                  </p>
                  <div className="result-card__actions">
                    <a className="btn btn--primary btn--lg btn--block" {...linkTo('/carrito')}>
                      Ver mi encargo y pagar
                    </a>
                    <button type="button" className="btn btn--ghost-ink btn--block" onClick={() => actions.resetBuilder()}>
                      Preparar otra {BRAND.productNoun}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="result-card">
                  <WaxSeal className="result-card__seal" color={ritual.items[0]?.deep ?? '#7d1d3a'} glyph="star" />
                  <h3 className="result-card__name">{name}</h3>
                  <ItemDetails
                    item={{ ...builder, name, quantity: builder.quantity }}
                    unitPrice={price}
                    compact
                    quantitySlot={
                      <QuantityStepper
                        value={builder.quantity}
                        onChange={actions.setQuantity}
                        label={`Cantidad de ${name}`}
                      />
                    }
                  />
                  <button
                    type="button"
                    className="btn btn--primary btn--lg btn--block"
                    onClick={() => {
                      addBuilderToCart()
                      setAdded(true)
                    }}
                  >
                    Agregar al carrito · {formatPrice(total)}
                  </button>
                  <p className="result-card__edit">
                    ¿Quieres cambiar algo?{' '}
                    <button type="button" className="btn-link" onClick={() => actions.goToChapter(CHAPTER.INTENCION)}>
                      Intención
                    </button>{' '}
                    ·{' '}
                    <button type="button" className="btn-link" onClick={() => actions.goToChapter(CHAPTER.TAMANO)}>
                      Tamaño
                    </button>{' '}
                    ·{' '}
                    <button type="button" className="btn-link" onClick={() => actions.goToChapter(CHAPTER.INGREDIENTES)}>
                      Ingredientes
                    </button>
                  </p>
                </div>
              )}
              {added && (
                <p className="revelation__added-note">
                  <CheckMark className="btn__icon" /> Puedes cambiar la cantidad o quitarla desde el carrito.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
