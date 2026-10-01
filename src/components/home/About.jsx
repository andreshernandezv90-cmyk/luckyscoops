import { BRAND } from '../../config/brand.js'
import { CrystalCluster, HerbSprig } from '../illustrations/TableProps.jsx'
import { SectionTitle } from './SectionTitle.jsx'

const VALUES = [
  { title: 'Hecho a mano', text: 'Cada frasco se llena pieza por pieza en nuestro taller. Ninguno sale igual.' },
  { title: 'Con intención', text: 'Elegimos cristales, hierbas y amuletos según lo que quieres atraer.' },
  { title: 'Con cuidado', text: 'Empacamos con papel, cartón y listón para que llegue intacto a tu puerta.' },
]

export function About() {
  return (
    <section className="section about" id="nosotros" aria-labelledby="about-title">
      <SectionTitle id="about-title" kicker="El taller">
        Sobre {BRAND.name}
      </SectionTitle>
      <div className="about__layout">
        <div className="about__copy parchment-panel">
          <p>
            {BRAND.name} nació en una mesa de cocina en {BRAND.foundedIn}, entre frascos reciclados, velas y cuadernos
            llenos de recetas. Lo que empezó como regalos para amigas se convirtió en un pequeño taller donde mezclamos
            cristales, hierbas secas y amuletos con calma y con cariño.
          </p>
          <p>
            Creemos que los rituales cotidianos ayudan a enfocar lo que deseamos. Por eso diseñamos el grimorio: para
            que preparar tu {BRAND.productNoun} sea tan especial como recibirla.
          </p>
          <HerbSprig className="about__herbs" />
        </div>
        <ul className="about__values">
          {VALUES.map((v) => (
            <li key={v.title}>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </li>
          ))}
          <li className="about__crystals" aria-hidden="true">
            <CrystalCluster />
          </li>
        </ul>
      </div>
    </section>
  )
}
