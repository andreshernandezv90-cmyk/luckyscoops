import { useEffect, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { BRAND } from '../config/brand.js'
import { appliedItems, buildRitual, liquidFor } from '../lib/ritual.js'
import { useSequence } from '../hooks/useSequence.js'
import { ANIMATION, useShop } from '../state/ShopContext.jsx'
import { Cauldron } from './Cauldron.jsx'
import { ParticleBurst } from './ParticleBurst.jsx'
import { BottleShape } from './illustrations/PotionBottle.jsx'
import { ExtraIcon } from './illustrations/Sigils.jsx'
import { CheckMark } from './illustrations/Ornaments.jsx'
import { getFocus, getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { getExtra } from '../data/extras.js'
import { ChapterHeading } from './ChapterHeading.jsx'

/** Posición donde el frasco se inclina para verter (su boca queda sobre el caldero). */
const POUR = { x: 166, y: 134 }
const DROP_START = { x: 200, y: 100 }
const SHELF_Y = 46

/**
 * Capítulo VI: preparación en el caldero.
 * Cada decisión de la receta se convierte en un frasco o ingrediente que vuela,
 * se vierte y cambia el color del líquido. Siempre se puede saltar.
 */
export function RitualAnimation({ onReveal, autoFocus }) {
  const { builder, actions } = useShop()
  const reduce = useReducedMotion()
  const ritual = useMemo(
    () => buildRitual(builder),
    // La receta no cambia dentro de este capítulo.
    [builder.intention, builder.size, builder.extras.join('+')],
  )
  const seq = useSequence(ritual.steps, {
    startFinished: builder.animationState === ANIMATION.DONE,
    onComplete: () => actions.setAnimation(ANIMATION.DONE),
  })

  // Si se sale del capítulo a mitad del ritual, queda pendiente de nuevo.
  const finishedRef = useRef(seq.finished)
  finishedRef.current = seq.finished
  useEffect(
    () => () => {
      if (!finishedRef.current) actions.setAnimation(ANIMATION.IDLE)
    },
    [actions],
  )

  const begin = () => {
    actions.setAnimation(ANIMATION.PLAYING)
    if (reduce) seq.skip()
    else seq.start()
  }

  const allIn = useMemo(() => new Set(ritual.items.map((_, i) => i)), [ritual])
  const applied = seq.finished ? allIn : appliedItems(ritual, seq.index)
  const liquid = liquidFor(ritual, applied)
  const phase = seq.step?.phase
  const activity = !seq.started && !seq.finished ? 'idle' : ['bubble', 'stir', 'drop', 'shimmer'].includes(phase) ? 'boil' : 'simmer'

  const lastStepOf = useMemo(() => {
    const last = {}
    ritual.steps.forEach((s, i) => {
      if (s.item !== undefined) last[s.item] = i
    })
    return last
  }, [ritual])

  const caption = seq.finished
    ? `Tu preparación está lista. Pulsa “Revelar mi ${BRAND.productNoun}”.`
    : seq.step?.line ?? `Todo está listo sobre la mesa. Cuando quieras, pulsa “Preparar mi ${BRAND.productNoun}”.`

  const activeItem = seq.step?.item !== undefined ? ritual.items[seq.step.item] : null
  const n = ritual.items.length

  return (
    <div className="ritual">
      <header className="chapter-intro chapter-intro--center">
        <p className="chapter-intro__kicker">Capítulo VI · Preparación</p>
        <ChapterHeading autoFocus={autoFocus}>Preparación en el Caldero</ChapterHeading>
        <p className="chapter-intro__text">
          Mira cómo cada elección entra al caldero. Dura unos segundos y puedes saltarlo cuando quieras.
        </p>
      </header>

      <div className="ritual__layout">
        <div className="ritual__stage">
          <svg
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Caldero del ritual. Ingredientes dentro: ${
              ritual.items.filter((_, i) => applied.has(i)).map((it) => it.name).join(', ') || 'ninguno todavía'
            }.`}
          >
            <MagicCircle spinning={seq.playing && !reduce} />
            <Cauldron
              liquid={liquid}
              activity={activity}
              stirKey={phase === 'stir' ? seq.index + 1 : 0}
              spoon="stir"
            />

            {/* Chorro de poción y salpicadura */}
            {phase === 'pour' && activeItem && (
              <>
                <motion.rect
                  key={`stream-${seq.index}`}
                  x="196"
                  y="148"
                  width="8"
                  height="58"
                  rx="4"
                  fill={activeItem.color}
                  initial={{ scaleY: 0, opacity: 1 }}
                  animate={{ scaleY: [0, 1, 1], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.5, times: [0, 0.35, 1] }}
                  style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
                />
                <Splash key={`splash-${seq.index}`} color={activeItem.glow} delay={0.15} />
              </>
            )}
            {phase === 'drop' && activeItem && <Splash key={`splash-${seq.index}`} color={activeItem.glow} delay={0.3} />}

            {/* Estante con los ingredientes que esperan su turno */}
            {ritual.items.map((item, i) => {
              const shelfX = 200 + (i - (n - 1) / 2) * 56
              let state = 'shelf'
              if (seq.finished || (seq.index > lastStepOf[i] && seq.started)) state = 'gone'
              else if (seq.step?.item === i) state = seq.step.phase
              return <RitualItem key={item.id} item={item} state={state} shelfX={shelfX} />
            })}

            {seq.step?.burst && (
              <ParticleBurst
                key={`burst-${seq.index}`}
                cx={200}
                cy={186}
                count={phase === 'shimmer' ? 22 : 14}
                spread={phase === 'shimmer' ? 140 : 100}
                rise={70}
                scale={1.6}
                {...seq.step.burst}
              />
            )}
          </svg>
        </div>

        <aside className="ritual__side" aria-label="Tu receta en el caldero">
          {!seq.started && !seq.finished ? (
            <ReceivedRecipe builder={builder} />
          ) : (
            <>
              <h3 className="ritual__side-title">Ingredientes del ritual</h3>
              <ol className="ritual__ingredients">
                {ritual.items.map((item, i) => (
                  <li key={item.id} className={applied.has(i) ? 'is-in' : ''}>
                    <span className="ritual__swatch" style={{ background: item.color }} aria-hidden="true" />
                    <span>{item.name}</span>
                    {applied.has(i) && (
                      <span className="ritual__in">
                        <CheckMark className="btn__icon" />
                        <span className="sr-only">(ya en el caldero)</span>
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}

          <p className="ritual__caption" aria-live="polite">
            {caption}
          </p>

          <div className="ritual__controls">
            {!seq.started && !seq.finished && (
              <>
                <button type="button" className="btn btn--primary btn--lg" onClick={begin}>
                  Preparar mi {BRAND.productNoun}
                </button>
                <button type="button" className="btn btn--text" onClick={seq.skip}>
                  Saltar animación
                </button>
              </>
            )}
            {seq.playing && (
              <button type="button" className="btn btn--ghost-ink" onClick={seq.skip}>
                Saltar animación
              </button>
            )}
            {seq.finished && (
              <>
                <button type="button" className="btn btn--primary btn--lg" onClick={onReveal}>
                  Revelar mi {BRAND.productNoun}
                </button>
                {!reduce && (
                  <button type="button" className="btn btn--text" onClick={begin}>
                    Repetir el ritual
                  </button>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

/** "La Bruja Sabia ha recibido tu receta": resumen antes de empezar. */
function ReceivedRecipe({ builder }) {
  const { forWhom, message } = builder.dedication
  const extras = builder.extras.map((e) => getExtra(e)?.name).filter(Boolean)
  return (
    <>
      <h3 className="ritual__side-title">La Bruja Sabia ha recibido tu receta</h3>
      <dl className="received-recipe">
        <div>
          <dt>Intención</dt>
          <dd>{getIntention(builder.intention)?.name}</dd>
        </div>
        <div>
          <dt>Personalización</dt>
          <dd>{getFocus(builder.intention, builder.focus)?.name ?? 'En manos de la Bruja Sabia'}</dd>
        </div>
        <div>
          <dt>Tamaño</dt>
          <dd>{getSize(builder.size)?.name}</dd>
        </div>
        <div>
          <dt>Extras</dt>
          <dd>{extras.length ? extras.join(', ') : 'Sin extras'}</dd>
        </div>
        {forWhom === 'gift' && (
          <div>
            <dt>Dedicatoria</dt>
            <dd>{message ? `“${message}”` : 'Es un regalo (sin dedicatoria)'}</dd>
          </div>
        )}
      </dl>
    </>
  )
}

function RitualItem({ item, state, shelfX }) {
  const isBottle = item.kind === 'bottle'
  const shelf = { x: shelfX, y: SHELF_Y, scale: 0.5, rotate: 0, opacity: 1 }
  let animate = shelf
  let transition = { duration: 0.35, ease: 'easeOut' }

  if (state === 'fly') {
    animate = isBottle ? { ...POUR, scale: 0.95, rotate: 0, opacity: 1 } : { ...DROP_START, scale: 0.95, rotate: 0, opacity: 1 }
    transition = { duration: 0.38, ease: [0.3, 0.7, 0.3, 1] }
  } else if (state === 'tilt' || state === 'pour') {
    animate = { ...POUR, scale: 0.95, rotate: 118, opacity: 1 }
    transition = { duration: 0.24, ease: 'easeInOut' }
  } else if (state === 'drop') {
    animate = { x: 200, y: 200, scale: 0.3, rotate: 50, opacity: 0 }
    transition = { duration: 0.38, ease: 'easeIn' }
  } else if (state === 'gone') {
    animate = { opacity: 0, scale: 0.6 }
    transition = { duration: 0.3 }
  }

  return (
    <motion.g
      initial={false}
      animate={animate}
      transition={transition}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      {isBottle ? (
        <BottleShape color={item.color} deep={item.deep} glow={item.glow} shape={item.shape} fill={0.78} />
      ) : (
        <g style={{ color: '#f1e6cc' }}>
          <circle r="30" fill={item.color} opacity="0.18" />
          <ExtraIcon id={item.id} color={item.color} x={-28} y={-28} width={56} height={56} />
        </g>
      )}
    </motion.g>
  )
}

function Splash({ color, delay = 0 }) {
  return (
    <motion.ellipse
      cx="200"
      cy="204"
      rx="12"
      ry="3"
      fill="none"
      stroke={color}
      strokeWidth="2"
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: [0.3, 3.2], opacity: [0.9, 0] }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    />
  )
}

/** Círculo de runas detrás del caldero; gira despacio mientras dura el ritual. */
export function MagicCircle({ spinning }) {
  const ticks = Array.from({ length: 24 }, (_, i) => i)
  return (
    <motion.g
      className="magic-circle"
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={spinning ? { duration: 40, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      aria-hidden="true"
    >
      <circle cx="200" cy="215" r="182" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="200" cy="215" r="170" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 6" />
      {ticks.map((i) => {
        const a = (i / ticks.length) * Math.PI * 2
        const x = 200 + Math.cos(a) * 176
        const y = 215 + Math.sin(a) * 176
        return i % 3 === 0 ? (
          <path
            key={i}
            d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z"
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
            fill="currentColor"
          />
        ) : (
          <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="1.2" fill="currentColor" />
        )
      })}
    </motion.g>
  )
}
