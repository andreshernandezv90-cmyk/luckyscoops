import { BRAND } from '../../config/brand.js'
import { CHAPTERS } from '../../data/chapters.js'
import { linkTo, ROUTES } from '../../lib/router.js'
import { SectionTitle } from './SectionTitle.jsx'

const STEP_TEXT = {
  intencion: 'Elige qué quieres atraer: amor, protección, abundancia o limpieza.',
  tamano: 'Escoge el tamaño de tu frasco: Aprendiz, Hechicera o Gran Bruja.',
  ingredientes: 'Si quieres, añade un cristal, un amuleto, un video o empaque de regalo.',
  preparacion: 'Mira cómo tus elecciones caen al caldero. Unos segundos, y puedes saltarlo.',
  revelacion: `Conoce tu ${BRAND.productNoun}, revisa el precio y agrégala al carrito.`,
}

export function HowItWorks() {
  return (
    <section className="section" id="como-funciona" aria-labelledby="how-title">
      <SectionTitle id="how-title" kicker="Cinco capítulos, un minuto">
        ¿Cómo funciona?
      </SectionTitle>
      <ol className="steps">
        {CHAPTERS.map((c) => (
          <li key={c.id} className="steps__item">
            <span className="steps__numeral" aria-hidden="true">{c.numeral}</span>
            <h3 className="steps__title">{c.title === 'Preparación' ? 'Ritual' : c.title}</h3>
            <p>{STEP_TEXT[c.id]}</p>
          </li>
        ))}
      </ol>
      <p className="section__cta">
        <a className="btn btn--primary btn--lg" {...linkTo(ROUTES.grimorio)}>
          Prepara tu {BRAND.productNoun}
        </a>
      </p>
    </section>
  )
}
