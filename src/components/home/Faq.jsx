import { FAQ } from '../../data/faq.js'
import { SectionTitle } from './SectionTitle.jsx'

export function Faq() {
  return (
    <section className="section" id="preguntas" aria-labelledby="faq-title">
      <SectionTitle id="faq-title" kicker="Dudas resueltas">
        Preguntas frecuentes
      </SectionTitle>
      <div className="faq">
        {FAQ.map((item) => (
          <details key={item.q} className="faq__item">
            <summary className="faq__question">{item.q}</summary>
            <p className="faq__answer">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
