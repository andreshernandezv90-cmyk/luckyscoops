import { CHAPTERS } from '../data/chapters.js'
import { canEnterChapter } from '../state/ShopContext.jsx'
import { CheckMark } from './illustrations/Ornaments.jsx'

/** Marcapáginas con los capítulos del Grimorio: muestra dónde estás y deja volver atrás. */
export function ChapterProgress({ current, builder, onSelect }) {
  const chapter = CHAPTERS[current]
  return (
    <nav className="chapter-progress" aria-label="Capítulos del grimorio">
      <p className="chapter-progress__status">
        <span>Capítulo {chapter.numeral} de {CHAPTERS.at(-1).numeral}</span> · <strong>{chapter.title}</strong>
      </p>
      <ol className="chapter-progress__list">
        {CHAPTERS.map((c, i) => {
          const reachable = canEnterChapter(builder, i)
          const state = i === current ? 'current' : i < current ? 'done' : reachable ? 'open' : 'locked'
          return (
            <li key={c.id} className={`chapter-progress__item is-${state}`}>
              <button
                type="button"
                className="chapter-progress__button"
                onClick={() => onSelect(i)}
                disabled={!reachable || i === current}
                aria-current={i === current ? 'step' : undefined}
                aria-label={`Capítulo ${c.numeral}: ${c.title}${state === 'done' ? ' (completado)' : ''}${state === 'locked' ? ' (aún bloqueado)' : ''}`}
              >
                <span className="chapter-progress__mark" aria-hidden="true">
                  {state === 'done' ? <CheckMark className="chapter-progress__check" /> : c.numeral}
                </span>
                <span className="chapter-progress__label" aria-hidden="true">
                  {c.title}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
