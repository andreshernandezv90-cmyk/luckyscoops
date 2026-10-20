import { useEffect } from 'react'
import { Hero } from './Hero.jsx'
import { CraftIntro } from './CraftIntro.jsx'
import { HowItWorks } from './HowItWorks.jsx'
import { IntentionsShowcase } from './IntentionsShowcase.jsx'
import { FeaturedScoops } from './FeaturedScoops.jsx'
import { Meanings } from './Meanings.jsx'
import { Videos } from './Videos.jsx'
import { ShippingPayments } from './ShippingPayments.jsx'
import { WiseWitch } from './WiseWitch.jsx'
import { Faq } from './Faq.jsx'
import { Contact } from './Contact.jsx'

/** Página de inicio. `section` desplaza a una sección (Scoops, Significados, Contacto…). */
export function Home({ section, stamp }) {
  useEffect(() => {
    if (!section) return
    const el = document.getElementById(section)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    el.querySelector('h2')?.setAttribute('tabindex', '-1')
    el.querySelector('h2')?.focus({ preventScroll: true })
  }, [section, stamp])

  return (
    <>
      <Hero />
      {/* Las secciones nacen de la oscuridad del Hero («Luz de vela», vela.css) */}
      <div className="vela-portada">
        <CraftIntro />
        <HowItWorks />
        <IntentionsShowcase />
        <FeaturedScoops />
        <Meanings />
        <Videos />
        <ShippingPayments />
        <WiseWitch />
        <Faq />
        <Contact />
      </div>
    </>
  )
}
