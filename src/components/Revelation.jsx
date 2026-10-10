import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BRAND } from '../config/brand.js'
import { getIntention } from '../data/intentions.js'
import { buildRitual, liquidFor, scoopColors } from '../lib/ritual.js'
import { REVEAL_STEPS, revealScene } from '../lib/motion.js'
import { playSound } from '../lib/sound.js'
import { formatPrice } from '../lib/format.js'
import { linkTo } from '../lib/router.js'
import { useSequence } from '../hooks/useSequence.js'
import { CHAPTER, useShop } from '../state/ShopContext.jsx'
import { Cauldron, Splash } from './Cauldron.jsx'
import { ScoopReveal } from './ScoopReveal.jsx'
import { MagicCircle } from './RitualAnimation.jsx'
import { ParticleBurst } from './ParticleBurst.jsx'
import { ItemDetails } from './OrderSummary.jsx'
import { QuantityStepper } from './QuantityStepper.jsx'
import { ChapterHeading } from './ChapterHeading.jsx'
import { WaxSeal } from './illustrations/Sigils.jsx'
import { CheckMark } from './illustrations/Ornaments.jsx'

/** Posición del cazo cuando la cuchara sale del caldero (coordenadas del lienzo 400×400). */
const SPOON_UP = { x: 198, y: 128 }

// El guion (fases y tiempos) vive en src/lib/motion.js; se reexporta por comodidad.
export { REVEAL_STEPS }

const HEADINGS = {
  hush: 'El caldero guarda silencio…',
  glow: 'Una luz nace dentro del caldero…',
  dip: 'La cuchara entra al caldero…',
  lift: 'La cuchara sube con tu receta…',
  summon: `Tu ${BRAND.productNoun} está siendo invocada…`,
  name: `Tu ${BRAND.productNoun} está siendo invocada…`,
}

const PHASE_SOUND = { dip: 'spoon', lift: 'splash', summon: 'reveal' }

/**
 * Capítulo VII: el momento de la revelación (ver REVEAL_STEPS).
 * El caldero se calma, nace una luz, la cuchara baja y sube con una cucharada
 * brillante, la Scoop se invoca sobre ella (<ScoopReveal>) y aparece su nombre.
 * Después la escena se recoge y entra la tarjeta con toda la información de
 * compra. Saltar o el movimiento reducido llevan directo al resultado.
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

  const phase = seq.finished ? 'reveal' : seq.step?.phase ?? 'hush'
  const scene = revealScene(phase)
  const intention = getIntention(builder.intention)
  const effect = intention?.effect ?? 'sparkles'
  const glowColor = ritual.items[0]?.glow ?? '#fff4d6'
  const glowColors = ritual.items.map((i) => i.glow).concat('#fff4d6')

  useEffect(() => {
    if (seq.playing && PHASE_SOUND[phase]) playSound(PHASE_SOUND[phase])
  }, [seq.index])

  return (
    <div className={`revelation is-${phase}`}>
      <div className="revelation__visual">
        <motion.div
          className="revelation__stage"
          initial={false}
          // Después de disfrutar la Scoop, la escena se recoge un poco y deja paso a la compra.
          animate={{ scale: seq.finished && !reduce ? 0.95 : 1 }}
          transition={{ duration: 0.6, ease: [0.3, 0, 0.2, 1] }}
        >
          <motion.div
            className="revelation__dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'hush' ? 0.6 : 1 }}
            transition={{ duration: reduce ? 0 : 0.4 }}
            aria-hidden="true"
          />
          <svg viewBox="0 0 400 400" role="img" aria-label={`El caldero brilla y la cuchara sostiene tu ${name}.`}>
            <MagicCircle spinning={!reduce && phase !== 'hush'} />
            <Cauldron
              liquid={liquid}
              activity={scene.activity}
              spoon={scene.spoon}
              spoonful={scene.spoonful ? glowColor : null}
              innerGlow={scene.innerGlow}
              drips={scene.drips}
            />
            {phase === 'glow' && (
              <ParticleBurst key="glow" cx={200} cy={200} count={10} spread={90} rise={50} scale={1.2} effect="sparkles" colors={glowColors} />
            )}
            {phase === 'dip' && <Splash key="dip" color={glowColor} delay={0.45} x={192} y={206} size={1.3} />}
            {scene.scoop && <ScoopReveal x={SPOON_UP.x} y={SPOON_UP.y} colors={scoopColors(ritual)} glow={glowColor} />}
            {phase === 'summon' && (
              <ParticleBurst key="summon" cx={SPOON_UP.x} cy={SPOON_UP.y - 20} count={18} spread={110} rise={40} scale={1.5} effect={effect} colors={glowColors} />
            )}
          </svg>
          {!seq.finished && (
            <button type="button" className="btn btn--text btn--on-dark revelation__skip" onClick={seq.skip}>
              Saltar animación
            </button>
          )}
        </motion.div>
        <AnimatePresence>
          {scene.name && (
            <motion.p
              className="revelation__name"
              initial={reduce ? false : { opacity: 0, letterSpacing: '0.45em', y: 6 }}
              animate={{ opacity: 1, letterSpacing: '0.12em', y: 0 }}
              transition={{ duration: 0.7, ease: [0.2, 0.7, 0.3, 1] }}
              aria-hidden="true"
            >
              {title}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="revelation__result">
        <p className="chapter-intro__kicker">Capítulo VII · Revelación</p>
        <ChapterHeading autoFocus={autoFocus} className={seq.finished ? 'revelation__title' : 'revelation__heading'}>
          {seq.finished ? `Tu ${BRAND.productNoun} ha sido revelada` : HEADINGS[phase]}
        </ChapterHeading>
        <p className="sr-only" role="status">
          {seq.finished ? `Tu ${BRAND.productNoun} ha sido revelada: ${title}, ${formatPrice(price)} cada una.` : ''}
        </p>

        <AnimatePresence>
          {seq.finished && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 26, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.2, 0.8, 0.3, 1] }}
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
