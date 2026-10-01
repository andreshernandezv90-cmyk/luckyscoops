import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BRAND } from '../config/brand.js'
import { CHAPTERS } from '../data/chapters.js'
import { formatPrice } from '../lib/format.js'
import { navigate } from '../lib/router.js'
import { ANIMATION, CHAPTER, canEnterChapter, useShop } from '../state/ShopContext.jsx'
import { BookPage } from './BookPage.jsx'
import { ChapterProgress } from './ChapterProgress.jsx'
import { ChapterHeading } from './ChapterHeading.jsx'
import { RecipeCard, recipeSummary } from './Recipe.jsx'
import { PotionSelector } from './PotionSelector.jsx'
import { SizeSelector } from './SizeSelector.jsx'
import { ExtrasSelector } from './ExtrasSelector.jsx'
import { RitualAnimation } from './RitualAnimation.jsx'
import { Revelation } from './Revelation.jsx'
import { ArrowIcon, ChapterDivider } from './illustrations/Ornaments.jsx'

const INTROS = {
  [CHAPTER.INTENCION]: {
    text: 'Toca la receta que más resuene contigo. Podrás cambiarla cuando quieras.',
    Selector: PotionSelector,
  },
  [CHAPTER.TAMANO]: {
    text: 'Cada círculo es un tamaño de frasco: entre más alto, más piezas y más intensidad en tu mezcla.',
    Selector: SizeSelector,
  },
  [CHAPTER.INGREDIENTES]: {
    text: 'Son opcionales. Añade los que quieras al ritual y quítalos cuando quieras.',
    Selector: ExtrasSelector,
  },
}

/** Qué hace el botón "Siguiente" en cada capítulo y qué falta para poder avanzar. */
function nextStep(chapter, builder) {
  switch (chapter) {
    case CHAPTER.INTENCION:
      return { label: 'Siguiente: Tamaño', short: 'Siguiente', ready: Boolean(builder.intention), hint: 'Elige una intención para continuar.' }
    case CHAPTER.TAMANO:
      return { label: 'Siguiente: Ingredientes', short: 'Siguiente', ready: Boolean(builder.size), hint: 'Elige un tamaño para continuar.' }
    case CHAPTER.INGREDIENTES:
      return { label: 'Ir al ritual', short: 'Ir al ritual', ready: true, hint: 'Los ingredientes extra son opcionales.' }
    case CHAPTER.PREPARACION:
      return {
        label: `Revelar mi ${BRAND.productNoun}`,
        short: 'Revelar',
        ready: builder.animationState === ANIMATION.DONE,
        hint: 'Inicia el ritual o sáltalo para continuar.',
      }
    default:
      return null
  }
}

const pageTurn = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 36 : -36, rotateY: dir > 0 ? 8 : -8 }),
  center: { opacity: 1, x: 0, rotateY: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -36 : 36, rotateY: dir > 0 ? -8 : 8 }),
}

/**
 * El grimorio abierto: estructura narrativa de toda la compra personalizada.
 * Capítulos I–III: página izquierda (instrucciones + receta) y derecha (opciones).
 * Capítulos IV–V: página desplegada para el ritual y la revelación.
 */
export function Grimorio() {
  const { builder, price, actions } = useShop()
  const reduce = useReducedMotion()
  const chapter = builder.currentChapter
  const [nudge, setNudge] = useState(false)
  const topRef = useRef(null)
  const prevChapter = useRef(chapter)
  const mounted = useRef(false)

  const direction = chapter >= prevChapter.current ? 1 : -1
  const autoFocus = mounted.current

  useEffect(() => {
    if (mounted.current && prevChapter.current !== chapter) {
      setNudge(false)
      const top = topRef.current?.getBoundingClientRect().top ?? 0
      if (top < 0) topRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
    prevChapter.current = chapter
    mounted.current = true
  }, [chapter, reduce])

  const goTo = (target) => {
    if (canEnterChapter(builder, target)) actions.goToChapter(target)
  }
  const next = nextStep(chapter, builder)
  const onNext = () => {
    if (!next.ready) {
      setNudge(true)
      return
    }
    goTo(chapter + 1)
  }
  const onPrev = () => {
    if (chapter === CHAPTER.INTENCION) navigate('/')
    else goTo(chapter - 1)
  }
  const prevLabel = chapter === CHAPTER.INTENCION ? 'Cerrar el grimorio' : `Anterior: ${CHAPTERS[chapter - 1].title}`

  return (
    <section className="grimorio" ref={topRef} aria-labelledby="grimorio-title">
      <div className="grimorio__inner">
        <h1 id="grimorio-title" className="grimorio__title">
          {BRAND.grimoireTitle}
        </h1>
        <ChapterProgress current={chapter} builder={builder} onSelect={goTo} />

        <div className={`book book--chapter-${chapter}`}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={chapter}
              className={`book__spread${chapter >= CHAPTER.PREPARACION ? ' book__spread--full' : ''}`}
              custom={direction}
              variants={pageTurn}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {chapter <= CHAPTER.INGREDIENTES && <SelectionSpread chapter={chapter} autoFocus={autoFocus} />}
              {chapter === CHAPTER.PREPARACION && (
                <BookPage side="full">
                  <RitualAnimation autoFocus={autoFocus} onReveal={() => goTo(CHAPTER.REVELACION)} />
                </BookPage>
              )}
              {chapter === CHAPTER.REVELACION && (
                <BookPage side="full" tone="night">
                  <Revelation autoFocus={autoFocus} />
                </BookPage>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {next && (
          <nav className={`book-nav${chapter < CHAPTER.PREPARACION ? ' book-nav--desktop' : ''}`} aria-label="Pasar de página">
            <button type="button" className="btn btn--ghost" onClick={onPrev}>
              <ArrowIcon direction="left" className="btn__icon" /> {prevLabel}
            </button>
            <p className={`book-nav__hint${nudge && !next.ready ? ' is-nudged' : ''}`} id="book-nav-hint" role="status">
              {!next.ready || chapter === CHAPTER.INGREDIENTES ? next.hint : ''}
            </p>
            <button
              type="button"
              className={`btn btn--primary${next.ready ? '' : ' is-waiting'}${chapter === CHAPTER.PREPARACION ? ' book-nav__next--duplicate' : ''}`}
              aria-disabled={!next.ready}
              aria-describedby="book-nav-hint"
              onClick={onNext}
            >
              {next.label} <ArrowIcon className="btn__icon" />
            </button>
          </nav>
        )}
      </div>

      {chapter < CHAPTER.PREPARACION && (
        <div className="recipe-bar" role="region" aria-label="Tu receta">
          <div className="recipe-bar__info">
            <span className="recipe-bar__summary">{recipeSummary(builder)}</span>
            {nudge && !next.ready ? (
              <span className="recipe-bar__hint">{next.hint}</span>
            ) : price === null ? (
              <span className="recipe-bar__pending">El precio aparece al elegir tamaño</span>
            ) : (
              <strong className="recipe-bar__price">{formatPrice(price)}</strong>
            )}
          </div>
          <div className="recipe-bar__actions">
            <button type="button" className="btn btn--ghost btn--icon" onClick={onPrev} aria-label={prevLabel}>
              <ArrowIcon direction="left" className="btn__icon" />
            </button>
            <button
              type="button"
              className={`btn btn--primary${next.ready ? '' : ' is-waiting'}`}
              aria-disabled={!next.ready}
              onClick={onNext}
            >
              {next.short} <ArrowIcon className="btn__icon" />
            </button>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {price === null ? '' : `Precio actual por ${BRAND.productNoun}: ${formatPrice(price)}`}
      </p>
    </section>
  )
}

function SelectionSpread({ chapter, autoFocus }) {
  const meta = CHAPTERS[chapter]
  const { text, Selector } = INTROS[chapter]
  return (
    <>
      <BookPage side="left">
        <header className="chapter-intro">
          <p className="chapter-intro__kicker">
            Capítulo {meta.numeral} · {meta.title}
          </p>
          <ChapterHeading autoFocus={autoFocus}>{meta.heading}</ChapterHeading>
          <p className="chapter-intro__text">{text}</p>
        </header>
        <div className="book-page__recipe">
          <ChapterDivider className="hide-mobile" />
          <RecipeCard />
        </div>
      </BookPage>
      <BookPage side="right">
        <Selector />
      </BookPage>
    </>
  )
}
