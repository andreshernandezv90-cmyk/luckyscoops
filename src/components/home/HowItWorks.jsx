import { BRAND } from '../../config/brand.js'
import { CHAPTERS } from '../../data/chapters.js'
import { linkTo, ROUTES } from '../../lib/router.js'
import { SectionTitle } from './SectionTitle.jsx'

const STEP_TEXT = {
  intencion: 'Elige qué deseas atraer: amor, protección, abundancia o limpieza.',
  tamano: 'Aprendiz, Hechicera o Gran Bruja: tú decides cuánta magia.',
  ingredientes: 'Si quieres, añade cristal, amuleto, Carta natal o empaque para regalo.',
  dedicatoria: 'Indica si es para ti o un regalo, con dedicatoria opcional.',
  preparacion: 'Mira cómo tu receta cae al caldero. Unos segundos, y puedes saltarlo.',
  revelacion: `Conoce tu ${BRAND.productNoun}, revisa el precio y agrégala a tu pedido.`,
}

export function HowItWorks() {
  return (
    <section className="section" id="como-funciona" aria-labelledby="how-title">
      <SectionTitle id="how-title" kicker="Seis capítulos, un par de minutos">
        ¿Cómo funciona el Grimorio?
      </SectionTitle>
      <ol className="steps">
        {CHAPTERS.map((c) => (
          <li key={c.id} className="steps__item">
            <span className="steps__numeral" aria-hidden="true">{c.numeral}</span>
            <h3 className="steps__title">{c.title}</h3>
            <p>{STEP_TEXT[c.id]}</p>
          </li>
        ))}
      </ol>
      <p className="section__cta">
        <a className="btn btn--primary btn--lg" {...linkTo(ROUTES.grimorio)}>
          Abrir el Grimorio
        </a>
      </p>
    </section>
  )
}
