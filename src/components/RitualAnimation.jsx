import { useEffect, useId, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { BRAND } from '../config/brand.js'
import { appliedItems, buildRitual, liquidFor } from '../lib/ritual.js'
import { arcKeyframes } from '../lib/motion.js'
import { playSound } from '../lib/sound.js'
import { useSequence } from '../hooks/useSequence.js'
import { ANIMATION, CHAPTER, useShop } from '../state/ShopContext.jsx'
import { Cauldron, IMPACT, Splash } from './Cauldron.jsx'
import { ParticleBurst } from './ParticleBurst.jsx'
import { BottleShape } from './illustrations/PotionBottle.jsx'
import { ExtraIcon } from './illustrations/Sigils.jsx'
import { CheckMark } from './illustrations/Ornaments.jsx'
import { CHAPTERS } from '../data/chapters.js'
import { getIntention } from '../data/intentions.js'
import { getSize } from '../data/sizes.js'
import { recipeExtras } from '../lib/pricing.js'
import { ChapterHeading } from './ChapterHeading.jsx'

/** Posición donde el frasco se inclina para verter (su boca queda sobre el caldero). */
const POUR = { x: 166, y: 134 }
/** Boca del frasco inclinado (118°) en esa posición: de aquí sale el chorro. */
const MOUTH = { x: 194, y: 149 }
const TILT = 118
const DROP_START = { x: 200, y: 100 }

/**
 * Estante de ingredientes sobre el caldero. El escenario es un disco (radio 200
 * en el lienzo) con overflow oculto: la fila se reparte en un ancho fijo y, si la
 * esquina de un ingrediente saldría de la zona segura, ese ingrediente baja lo
 * justo para quedar dentro. Así ninguno se corta, haya pocos o muchos.
 */
const SHELF = { y: 67, scale: 0.45, gap: 56, span: 220 }
const SAFE_RADIUS = 181
/** Medio ancho y alto sobre el centro de un ingrediente a escala 1 (frasco de 60 × 82). */
const ITEM_HALF = { w: 30, top: 34 }

function shelfSpot(i, n) {
  const step = n > 1 ? Math.min(SHELF.gap, SHELF.span / (n - 1)) : 0
  const x = 200 + (i - (n - 1) / 2) * step
  const reach = Math.abs(x - 200) + ITEM_HALF.w * SHELF.scale
  const top = 200 - Math.sqrt(SAFE_RADIUS ** 2 - reach ** 2)
  return { x, y: Math.round(Math.max(SHELF.y, top + ITEM_HALF.top * SHELF.scale)) }
}

/** Sonido sutil de cada fase (solo si la persona activó el sonido). */
const PHASE_SOUND = { tilt: 'bottle', pour: 'pour', bubble: 'bubble', stir: 'spoon', drop: 'splash', shimmer: 'bubble' }

/**
 * Capítulo V: preparación en el caldero.
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

  const stageRef = useRef(null)
  const layoutRef = useRef(null)
  /** ¿El foco estaba en los botones del ritual? Al cambiar los botones, se queda ahí. */
  const focusInControls = useRef(false)
  const showStage = useRef(false)
  /** El ritual empezó en esta visita: al terminar, "Revelar" debe quedar a la vista. */
  const showReveal = useRef(false)

  const begin = () => {
    actions.setAnimation(ANIMATION.PLAYING)
    if (reduce) seq.skip()
    else seq.start()
    showStage.current = true
    showReveal.current = true
  }

  useEffect(() => {
    // En celular el botón queda bajo el caldero: al empezar, se desplaza lo justo para verlo
    // completo (sin animación si la persona pidió reducir el movimiento). Se hace ya con el
    // panel lateral actualizado, para que el destino no cambie.
    if (showStage.current) {
      showStage.current = false
      stageRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
    }
    // Preparar → Saltar → Revelar: el botón pulsado desaparece y el foco pasa al nuevo
    // sin mover la página, para que el caldero siga a la vista.
    const active = document.activeElement
    if (focusInControls.current && (!active || active === document.body)) {
      // El primer botón visible: en celular, "Saltar" está sobre el caldero.
      const buttons = layoutRef.current?.querySelectorAll('button') ?? []
      ;[...buttons].find((b) => b.offsetParent !== null)?.focus({ preventScroll: true })
    }
    // Al terminar: si "Revelar" quedó fuera de la pantalla (recetas largas en celular), se
    // desplaza solo lo necesario para verlo; así el caldero sigue a la vista casi completo.
    if (seq.finished && showReveal.current) {
      showReveal.current = false
      revealIntoView(layoutRef.current?.querySelector('.ritual__controls .btn--primary'), reduce)
    }
  }, [seq.started, seq.finished])

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

  // El frasco que acaba de vaciarse se endereza y se deshace en destellos.
  const vanishing = seq.playing
    ? ritual.items.findIndex((item, i) => item.kind === 'bottle' && lastStepOf[i] === seq.index - 1)
    : -1

  useEffect(() => {
    if (seq.playing && PHASE_SOUND[phase]) playSound(PHASE_SOUND[phase])
  }, [seq.index])

  return (
    <div className="ritual">
      <header className="chapter-intro chapter-intro--center">
        <p className="chapter-intro__kicker">Capítulo {CHAPTERS[CHAPTER.PREPARACION].numeral} · Preparación</p>
        <ChapterHeading autoFocus={autoFocus}>Preparación en el Caldero</ChapterHeading>
        <p className="chapter-intro__text">
          Mira cómo cada elección entra al caldero. Dura unos segundos y puedes saltarlo cuando quieras.
        </p>
      </header>

      <div
        className="ritual__layout"
        ref={layoutRef}
        onFocus={() => (focusInControls.current = true)}
        onBlur={(e) => {
          if (e.relatedTarget) focusInControls.current = false
        }}
      >
        <div className="ritual__stage" ref={stageRef}>
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
                <PourStream key={`stream-${seq.index}`} color={activeItem.color} glow={activeItem.glow} reduce={reduce} />
                <Splash key={`splash-${seq.index}`} color={activeItem.glow} delay={0.12} />
              </>
            )}
            {phase === 'drop' && activeItem && <Splash key={`splash-${seq.index}`} color={activeItem.glow} delay={0.28} size={0.8} />}
            {vanishing >= 0 && (
              <ParticleBurst
                key={`vanish-${seq.index}`}
                cx={POUR.x}
                cy={POUR.y - 18}
                count={8}
                spread={34}
                rise={30}
                scale={1}
                duration={0.9}
                effect="sparkles"
                colors={[ritual.items[vanishing].glow, '#fff4d6']}
              />
            )}

            {/* Estante con los ingredientes que esperan su turno */}
            {ritual.items.map((item, i) => {
              let state = 'shelf'
              if (seq.finished || (seq.index > lastStepOf[i] && seq.started)) state = 'gone'
              else if (seq.step?.item === i) state = seq.step.phase
              return <RitualItem key={item.id} item={item} state={state} spot={shelfSpot(i, n)} />
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
          {/* En celular "Saltar" va sobre el caldero: se ve sin tener que bajar */}
          {seq.playing && (
            <button type="button" className="btn btn--text btn--on-dark revelation__skip ritual__skip-stage" onClick={seq.skip}>
              Saltar animación
            </button>
          )}
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
              <button type="button" className="btn btn--ghost-ink ritual__skip-side" onClick={seq.skip}>
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

/** Margen entre el botón y el borde de la pantalla al acercarlo. */
const VIEW_MARGIN = 16

/** Desplaza lo mínimo para que el botón quede visible (bajo el encabezado fijo). No hace nada si ya se ve. */
function revealIntoView(button, reduce) {
  if (!button) return
  const rect = button.getBoundingClientRect()
  const top = (document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0) + VIEW_MARGIN
  const bottom = window.innerHeight - VIEW_MARGIN
  let delta = 0
  if (rect.bottom > bottom) delta = rect.bottom - bottom
  else if (rect.top < top) delta = rect.top - top
  if (delta !== 0) window.scrollBy({ top: delta, behavior: reduce ? 'auto' : 'smooth' })
}

/** "La Bruja Sabia ha recibido tu receta": resumen antes de empezar. */
function ReceivedRecipe({ builder }) {
  const { forWhom, message } = builder.dedication
  const extras = recipeExtras(builder).map((e) => (e.included ? `${e.name} (incluida)` : e.name))
  return (
    <>
      <h3 className="ritual__side-title">La Bruja Sabia ha recibido tu receta</h3>
      <dl className="received-recipe">
        <div>
          <dt>Intención</dt>
          <dd>{getIntention(builder.intention)?.name}</dd>
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

function RitualItem({ item, state, spot }) {
  const isBottle = item.kind === 'bottle'
  const shelf = { ...spot, scale: SHELF.scale, rotate: 0, opacity: 1 }
  let animate = shelf
  let transition = { duration: 0.35, ease: 'easeOut' }
  const tilted = state === 'tilt' || state === 'pour'

  if (state === 'fly') {
    // Vuelo con peso: se agacha, sube, describe un arco, se pasa un poco y se estabiliza.
    const arc = arcKeyframes(spot, isBottle ? POUR : DROP_START, { lift: isBottle ? 34 : 26, fromScale: SHELF.scale })
    animate = { x: arc.x, y: arc.y, scale: arc.scale, rotate: arc.rotate, opacity: 1 }
    transition = { duration: isBottle ? 0.52 : 0.4, times: arc.times, ease: arc.ease }
  } else if (tilted) {
    // Se inclina con una pequeña sobrepasada, como un frasco lleno.
    // (En 'pour' el valor ya no cambia, así que la inclinación no se repite.)
    animate = { ...POUR, scale: 0.95, rotate: state === 'tilt' ? [0, TILT + 9, TILT] : TILT, opacity: 1 }
    transition = { duration: 0.3, times: [0, 0.7, 1], ease: ['easeIn', 'easeOut'] }
  } else if (state === 'drop') {
    // Cae acelerando hacia el líquido.
    animate = { x: IMPACT.x, y: IMPACT.y - 4, scale: 0.3, rotate: 50, opacity: [1, 1, 0] }
    transition = { duration: 0.34, ease: [0.5, 0, 1, 1] }
  } else if (state === 'gone') {
    // Ya vertido: se endereza, sube un poco y se desvanece en destellos.
    animate = isBottle ? { x: POUR.x, y: POUR.y - 26, rotate: 20, scale: 0.6, opacity: 0 } : { opacity: 0, scale: 0.3 }
    transition = { duration: 0.45, ease: 'easeOut' }
  }

  return (
    <motion.g
      initial={false}
      animate={animate}
      transition={transition}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      {isBottle ? (
        <BottleShape
          color={item.color}
          deep={item.deep}
          glow={item.glow}
          shape={item.shape}
          fill={state === 'pour' || state === 'gone' ? 0.14 : 0.78}
          tilt={tilted ? TILT : 0}
        />
      ) : (
        <g style={{ color: '#f1e6cc' }}>
          <circle r="30" fill={item.color} opacity="0.18" />
          <ExtraIcon id={item.id} color={item.color} x={-28} y={-28} width={56} height={56} />
        </g>
      )}
    </motion.g>
  )
}

/**
 * Chorro de poción en SVG: sale de la boca del frasco, se estrecha, oscila un
 * poco, tiene un brillo en el borde y suelta gotas. Al final se corta desde
 * arriba y cae.
 */
const STREAM_D = `M${MOUTH.x - 3.5} ${MOUTH.y} C${MOUTH.x - 2} 162 197.5 174 197.6 ${IMPACT.y} L202.4 ${IMPACT.y} C202.6 172 ${MOUTH.x + 3} 160 ${MOUTH.x + 2.5} ${MOUTH.y} Z`

function PourStream({ color, glow, reduce }) {
  const clipId = `stream-clip-${useId().replace(/:/g, '')}`
  const length = IMPACT.y - MOUTH.y + 4
  return (
    <g aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <motion.rect
            x="180"
            width="40"
            initial={{ attrY: MOUTH.y, height: 0 }}
            animate={reduce ? { attrY: MOUTH.y, height: length } : { attrY: [MOUTH.y, MOUTH.y, MOUTH.y, IMPACT.y], height: [0, length, length, 0] }}
            transition={{ duration: 0.52, times: [0, 0.22, 0.78, 1], ease: ['easeIn', 'linear', 'easeIn'] }}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {/* Oscila apenas: se tuerce y se estrecha desde la boca del frasco */}
        <motion.path
          d={STREAM_D}
          fill={color}
          animate={reduce ? undefined : { skewX: [0, 2.5, -1.5, 0], scaleX: [1, 0.86, 1.06, 1] }}
          transition={{ duration: 0.28, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
        />
        {/* Brillo del borde */}
        <path
          d={`M${MOUTH.x - 1.5} ${MOUTH.y + 2} C${MOUTH.x} 163 198.6 176 198.8 ${IMPACT.y - 2}`}
          fill="none"
          stroke={glow}
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>
      {/* Gotas que se desprenden del chorro */}
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={196 + i * 3.5}
            r={1.3 + (i % 2) * 0.5}
            fill={color}
            initial={{ cy: MOUTH.y + 8, opacity: 0 }}
            animate={{ cy: [MOUTH.y + 8, IMPACT.y], x: [0, (i - 1) * 5], opacity: [0, 1, 0] }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.11, ease: 'easeIn' }}
          />
        ))}
    </g>
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
