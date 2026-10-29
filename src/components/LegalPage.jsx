import { LEGAL_LINKS, LEGAL_PAGES } from '../data/legal.js'
import { SHOW_PENDING } from '../config/env.js'
import { linkTo } from '../lib/router.js'
import { ChapterDivider } from './illustrations/Ornaments.jsx'

/**
 * Página legal (Aviso de Privacidad, Términos, Envíos, Cambios y devoluciones).
 * El contenido vive en src/data/legal.js. Una sección sin datos confirmados
 * muestra "Pendiente: …" en desarrollo y "Información en preparación" publicada.
 */
export function LegalPage({ route }) {
  const page = LEGAL_PAGES[route]
  if (!page) return null
  return (
    <article className="page page--narrow legal" aria-labelledby="legal-title">
      <header className="page__header">
        <p className="page__kicker">Información legal</p>
        <h1 id="legal-title" className="page__title">
          {page.title}
        </h1>
        <p className="page__lead">{page.lead}</p>
        <ChapterDivider className="page__divider" />
      </header>

      <div className="parchment-panel legal__body">
        {page.sections.map((section) => (
          <section key={section.heading} className="legal__section">
            <h2 className="legal__heading">{section.heading}</h2>
            {section.body?.map((block, i) =>
              block.list ? (
                <ul key={i} className="legal__list">
                  {block.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={i}>{block.p}</p>
              ),
            )}
            {section.pending && (
              <p className="legal__pending">
                {SHOW_PENDING ? (
                  <>
                    <span className="pending-tag">Pendiente</span> {section.pending}
                  </>
                ) : (
                  'Información en preparación.'
                )}
              </p>
            )}
          </section>
        ))}
      </div>

      <nav className="legal__nav" aria-label="Otras páginas legales">
        <ul>
          {LEGAL_LINKS.filter((l) => l.route !== route).map((l) => (
            <li key={l.route}>
              <a {...linkTo(l.route)}>{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  )
}
