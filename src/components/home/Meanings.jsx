import { MEANINGS } from '../../data/meanings.js'
import { ExtraIcon } from '../illustrations/Sigils.jsx'
import { SectionTitle } from './SectionTitle.jsx'

function MeaningArt({ item }) {
  if (item.image) return <img className="meaning-card__photo" src={item.image} alt="" loading="lazy" />
  if (item.kind === 'hierba') {
    return (
      <svg className="meaning-card__icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <path d="M32 58 V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        {[16, 26, 36, 46].map((y, i) => (
          <g key={y} fill={item.color} stroke="currentColor" strokeWidth="1">
            <ellipse cx={i % 2 ? 40 : 24} cy={y} rx="8" ry="3.6" transform={`rotate(${i % 2 ? -30 : 30} ${i % 2 ? 40 : 24} ${y})`} />
            <ellipse cx={i % 2 ? 24 : 40} cy={y + 5} rx="7" ry="3.2" transform={`rotate(${i % 2 ? 30 : -30} ${i % 2 ? 24 : 40} ${y + 5})`} />
          </g>
        ))}
      </svg>
    )
  }
  return <ExtraIcon id={item.kind === 'amuleto' ? 'amuleto' : 'cristal'} color={item.color} className="meaning-card__icon" />
}

/** "El significado de tu magia": información básica de lo que puede venir en una Scoop. */
export function Meanings() {
  return (
    <section className="section" id="significados" aria-labelledby="meanings-title">
      <SectionTitle id="meanings-title" kicker="Páginas del Grimorio">
        El significado de tu magia
      </SectionTitle>
      <p className="section__lead">
        Algunos de los cristales, hierbas y amuletos que pueden aparecer en tu Scoop y lo que tradicionalmente simbolizan.
      </p>
      {/* TODO / PENDIENTE: reemplazar por los productos reales en src/data/meanings.js */}
      <ul className="meaning-grid">
        {MEANINGS.map((item) => (
          <li key={item.id} className="meaning-card" style={{ '--accent': item.color }}>
            <MeaningArt item={item} />
            <div>
              <h3 className="meaning-card__name">{item.name}</h3>
              <p className="meaning-card__text">{item.meaning}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="section__fineprint">
        Significados simbólicos y tradicionales. No sustituyen la atención médica, psicológica ni ningún consejo profesional.
      </p>
    </section>
  )
}
