import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BRAND } from '../config/brand.js'
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

/**
 * Guion de la revelación. Cada fase dura poco y todo se puede saltar.
 *   glow  humo, brillo y partículas sobre el caldero
 *   dip   la cuchara entra al caldero
 *   lift  sale una cucharada con la Scoop
 *   (fin) la Scoop se revela desde la cucharada (ver ScoopBloom)
 *
 * Para una animación final más elaborada, agrega fases aquí y dibújalas en
 * <ScoopBloom> o en el SVG de abajo; el resto del capítulo no cambia.
 */
export const REVEAL_STEPS = [
  { phase: 'glow', duration: 450 },
  { phase: 'dip', duration: 600 },
  { phase: 'lift', duration: 850 },
]

/** Posición del cazo cuando la cuchara sale del caldero (coordenadas del lienzo 400×400). */
const SPOON_UP = { x: 198, y: 128 }

/**
 * Capítulo VII: la cuchara entra al caldero y sale con la Scoop.
 * Después se muestra el resultado con toda la información de compra.
 */
export function Revelation({ autoFocus }) {
  const { builder, price, total, name, title, actions, addBuilderToCart } = useShop()
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

  const phase = seq.finished ? 'reveal' : seq.step?.phase ?? 'glow'
  const spoon = phase === 'dip' ? 'dip' : phase === 'lift' || phase === 'reveal' ? 'lift' : 'rest'
  const effect = getIntention(builder.intention)?.effect ?? 'sparkles'
  const glowColors = ritual.items.map((i) => i.glow).concat('#fff4d6')
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
          {phase === 'glow' && (
            <ParticleBurst key="glow" cx={200} cy={196} count={16} spread={120} rise={60} scale={1.3} effect="sparkles" colors={glowColors} />
          )}
          {phase === 'reveal' && (
            <>
              <ScoopBloom color={ritual.items[0]?.glow ?? '#fff4d6'} reduce={reduce} />
              <ParticleBurst
                key="reveal"
                cx={SPOON_UP.x}
                cy={SPOON_UP.y - 20}
                count={20}
                spread={110}
                rise={40}
                scale={1.5}
                effect={effect}
                colors={glowColors}
              />
            </>
          )}
        </svg>
        {!seq.finished && (
          <button type="button" className="btn btn--text btn--on-dark revelation__skip" onClick={seq.skip}>
            Saltar animación
          </button>
        )}
      </div>

      <div className="revelation__result">
        <p className="chapter-intro__kicker">Capítulo VII · Revelación</p>
        <ChapterHeading autoFocus={autoFocus} className={seq.finished ? 'revelation__title' : 'revelation__heading'}>
          {seq.finished ? `Tu ${BRAND.productNoun} ha sido revelada` : 'La cuchara entra al caldero…'}
        </ChapterHeading>
        <p className="sr-only" role="status">
          {seq.finished ? `Tu ${BRAND.productNoun} ha sido revelada: ${title}, ${formatPrice(price)} cada una.` : ''}
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
                  <h3 className="result-card__name">¡Listo! Tu {BRAND.productNoun} está en tu pedido</h3>
                  <p className="result-card__text">
                    {builder.quantity} × {name} · {formatPrice(total)}
                  </p>
                  <div className="result-card__actions">
                    <a className="btn btn--primary btn--lg btn--block" {...linkTo('/carrito')}>
                      Ver mi pedido
                    </a>
                    <button type="button" className="btn btn--ghost-ink btn--block" onClick={() => actions.resetBuilder()}>
                      Preparar otra {BRAND.productNoun}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="result-card">
                  <WaxSeal className="result-card__seal" color={ritual.items[0]?.deep ?? '#5a2591'} glyph="star" />
                  <h3 className="result-card__name">{title}</h3>
                  <ItemDetails
                    item={{ ...builder, name, quantity: builder.quantity }}
                    unitPrice={price}
                    compact
                    totalLabel="Total"
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
                    Agregar a mi pedido · {formatPrice(total)}
                  </button>
                  <p className="result-card__edit">
                    ¿Quieres cambiar algo?{' '}
                    {EDIT_LINKS.map(([chapter, label], i) => (
                      <span key={label}>
                        {i > 0 && ' · '}
                        <button type="button" className="btn-link" onClick={() => actions.goToChapter(chapter)}>
                          {label}
                        </button>
                      </span>
                    ))}
                  </p>
                </div>
              )}
              {added && (
                <p className="revelation__added-note">
                  <CheckMark className="btn__icon" /> Puedes cambiar la cantidad o quitarla desde tu pedido.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const EDIT_LINKS = [
  [CHAPTER.INTENCION, 'Intención'],
  [CHAPTER.ENFOQUE, 'Enfoque'],
  [CHAPTER.TAMANO, 'Tamaño'],
  [CHAPTER.INGREDIENTES, 'Extras'],
  [CHAPTER.DEDICATORIA, 'Dedicatoria'],
]

/**
 * La Scoop se revela desde la cucharada: un halo que se abre sobre el cazo.
 * PUNTO DE EXTENSIÓN: reemplaza este componente por la ilustración o
 * animación final (por ejemplo, el frasco de la Scoop saliendo de la luz).
 */
function ScoopBloom({ color, reduce }) {
  return (
    <motion.circle
      cx={SPOON_UP.x}
      cy={SPOON_UP.y - 14}
      r="44"
      fill={color}
      initial={reduce ? false : { scale: 0.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.28 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center', mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  )
}
