import { useEffect } from 'react'
import { Hero } from './Hero.jsx'
import { CraftIntro } from './CraftIntro.jsx'
import { HowItWorks } from './HowItWorks.jsx'
import { IntentionsShowcase } from './IntentionsShowcase.jsx'
import { FeaturedScoops } from './FeaturedScoops.jsx'
import { About } from './About.jsx'
import { Faq } from './Faq.jsx'
import { Contact } from './Contact.jsx'

/** Página de inicio. `section` desplaza a una sección (Productos, Contacto…). */
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
      <CraftIntro />
      <HowItWorks />
      <IntentionsShowcase />
      <FeaturedScoops />
      <About />
      <Faq />
      <Contact />
    </>
  )
}
