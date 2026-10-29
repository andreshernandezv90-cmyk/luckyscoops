import { lazy, Suspense, useEffect, useRef } from 'react'
import { MotionConfig } from 'motion/react'
import { BRAND } from './config/brand.js'
import { HOME_SECTIONS, ROUTES, useRoute } from './lib/router.js'
import { ShopProvider } from './state/ShopContext.jsx'
import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { Home } from './components/home/Home.jsx'

// El Grimorio y las páginas de compra se cargan aparte: el inicio pesa menos.
// Se precargan en cuanto el navegador está libre, así abrir el libro es inmediato.
const loaders = {
  grimorio: () => import('./components/Grimorio.jsx'),
  tienda: () => Promise.all([import('./components/Cart.jsx'), import('./components/Checkout.jsx'), import('./components/OrderComplete.jsx')]),
}
const Grimorio = lazy(() => loaders.grimorio().then((m) => ({ default: m.Grimorio })))
const Cart = lazy(() => import('./components/Cart.jsx').then((m) => ({ default: m.Cart })))
const Checkout = lazy(() => import('./components/Checkout.jsx').then((m) => ({ default: m.Checkout })))
const OrderComplete = lazy(() => import('./components/OrderComplete.jsx').then((m) => ({ default: m.OrderComplete })))
const LegalPage = lazy(() => import('./components/LegalPage.jsx').then((m) => ({ default: m.LegalPage })))

function preloadPages() {
  const run = () => {
    loaders.grimorio()
    loaders.tienda()
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2500 })
  else window.setTimeout(run, 1200)
}

const PAGES = {
  [ROUTES.grimorio]: { title: BRAND.grimoireTitle, Component: Grimorio },
  [ROUTES.carrito]: { title: 'Tu pedido', Component: Cart },
  [ROUTES.pago]: { title: 'Finalizar compra', Component: Checkout },
  [ROUTES.confirmacion]: { title: 'Pedido confirmado', Component: OrderComplete },
  [ROUTES.privacidad]: { title: 'Aviso de Privacidad', Component: LegalPage },
  [ROUTES.terminos]: { title: 'Términos y Condiciones', Component: LegalPage },
  [ROUTES.entregas]: { title: 'Envíos y entregas', Component: LegalPage },
  [ROUTES.devoluciones]: { title: 'Cambios, devoluciones y cancelaciones', Component: LegalPage },
}

export default function App() {
  const { path, stamp } = useRoute()
  const page = PAGES[path]
  const mainRef = useRef(null)
  const firstRender = useRef(true)

  useEffect(preloadPages, [])

  useEffect(() => {
    document.title = page ? `${page.title} · ${BRAND.name}` : `${BRAND.name} · ${BRAND.grimoireTitle}`
    if (!HOME_SECTIONS[path]) {
      window.scrollTo(0, 0)
      // Al cambiar de página, el foco va al contenido para lectores de pantalla.
      if (!firstRender.current) mainRef.current?.focus({ preventScroll: true })
    }
    firstRender.current = false
  }, [path, page, stamp])

  return (
    <MotionConfig reducedMotion="user">
      <ShopProvider>
        <a className="skip-link" href="#contenido" onClick={(e) => { e.preventDefault(); mainRef.current?.focus() }}>
          Saltar al contenido
        </a>
        <Header path={path} />
        <main id="contenido" ref={mainRef} tabIndex={-1} className={`site-main${path === ROUTES.grimorio ? ' site-main--grimorio' : ''}`}>
          <Suspense fallback={<p className="page-loading" role="status">Abriendo el Grimorio…</p>}>
            {page ? <page.Component route={path} /> : <Home section={HOME_SECTIONS[path]} stamp={stamp} />}
          </Suspense>
        </main>
        <Footer />
      </ShopProvider>
    </MotionConfig>
  )
}
