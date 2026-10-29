import { BRAND } from '../config/brand.js'
import { ROUTES } from '../lib/router.js'

/**
 * Páginas legales.
 *
 * Solo dicen lo que ya es cierto por cómo funciona el sitio (qué datos pide,
 * qué guarda el navegador). Todo lo que depende del negocio —responsable,
 * domicilio, finalidades, plazos, políticas— queda en `pending` y NO se
 * inventa: en desarrollo se ve como "PENDIENTE"; en la versión publicada, como
 * "Información en preparación".
 *
 * TODO / PENDIENTE: completar con los datos que confirme la dueña. Al llenar
 * una sección, quita su `pending` y escribe el texto en `body`.
 */

/** Párrafos o listas: { p: 'texto' } o { list: ['a', 'b'] }. */
const p = (text) => ({ p: text })
const list = (...items) => ({ list: items })

export const LEGAL_PAGES = {
  [ROUTES.privacidad]: {
    title: 'Aviso de Privacidad',
    lead: `Qué datos personales pide ${BRAND.name} y qué pasa con ellos.`,
    sections: [
      {
        heading: 'Responsable de tus datos',
        pending: 'Nombre o razón social del responsable, domicilio y correo para temas de privacidad.',
      },
      {
        heading: 'Datos que te pedimos',
        body: [
          p('Para preparar tu pedido, el formulario de compra pide:'),
          list(
            'Nombre completo.',
            'Teléfono o WhatsApp.',
            'Correo electrónico (opcional).',
            'Dirección de envío: calle y número, colonia, código postal, ciudad o municipio y estado.',
            'Notas para tu pedido (opcional).',
            'Si tu Scoop es un regalo, la dedicatoria que escribas (opcional).',
          ),
          p(
            'Si tu pedido incluye Carta natal, también pide el nombre completo y la fecha de nacimiento de la persona para quien se hará la carta. Puede ser alguien distinto de quien compra o recibe el paquete.',
          ),
        ],
      },
      {
        heading: 'Para qué los usamos',
        pending: 'Finalidades del tratamiento (primarias y, si las hay, secundarias) confirmadas por la responsable.',
      },
      {
        heading: 'Qué se guarda en tu navegador',
        body: [
          list(
            'Tu carrito (qué Scoops elegiste y cuántas) se guarda en este navegador para que no se pierda. No lleva datos personales.',
            'Los datos del formulario de compra, incluidos los de la Carta natal, solo se guardan junto con el resumen de tu pedido mientras la pestaña está abierta; al cerrarla se borran.',
            'El sitio no usa cookies de publicidad ni herramientas de analítica.',
          ),
        ],
      },
      {
        heading: 'Envío de tu pedido por WhatsApp',
        body: [
          p(
            'Al terminar, el sitio prepara un mensaje con tu pedido. Si decides enviarlo por WhatsApp, ese mensaje viaja a través de WhatsApp, un servicio de terceros con sus propias políticas.',
          ),
        ],
      },
      {
        heading: 'Con quién se comparten',
        pending: 'Terceros que reciben datos (paquetería, medios de pago u otros) y con qué fin.',
      },
      {
        heading: 'Tus derechos (acceso, rectificación, cancelación y oposición)',
        pending: 'Medio y procedimiento para ejercerlos o para revocar tu consentimiento.',
      },
      {
        heading: 'Cambios a este aviso',
        pending: 'Cómo se avisará de los cambios y fecha de la última actualización.',
      },
    ],
  },

  [ROUTES.terminos]: {
    title: 'Términos y Condiciones',
    lead: `Las condiciones para comprar en ${BRAND.name}.`,
    sections: [
      {
        heading: 'Uso simbólico y decorativo',
        body: [
          p(
            `Nuestras ${BRAND.productNounPlural} son objetos de uso simbólico y decorativo que acompañan tus rituales e intenciones personales. No sustituyen la atención médica, psicológica ni ningún consejo profesional, y no tienen efectos garantizados.`,
          ),
        ],
      },
      {
        heading: `Contenido de cada ${BRAND.productNoun}`,
        body: [
          p(
            `La experiencia conserva un componente sorpresa: los artículos pueden variar según la intención, el tamaño, los extras y el inventario disponible.`,
          ),
        ],
      },
      {
        heading: 'Precios y pago',
        body: [
          p(
            'Los precios están en pesos mexicanos (MXN). El costo de envío y la forma de pago se confirman contigo antes de pagar.',
          ),
        ],
        pending: 'Formas de pago disponibles, momento del cargo y facturación.',
      },
      {
        heading: 'Cómo se confirma un pedido',
        pending: 'Cuándo se considera aceptado un pedido y qué pasa si un artículo no está disponible.',
      },
      {
        heading: 'Responsable y contacto',
        pending: 'Nombre o razón social, domicilio y medio de contacto del vendedor.',
      },
    ],
  },

  [ROUTES.entregas]: {
    title: 'Envíos y entregas',
    lead: 'Cómo llega tu pedido.',
    sections: [
      {
        heading: 'Cobertura',
        body: [
          p(
            `Enviamos a toda la República Mexicana. El costo depende del tamaño de la ${BRAND.productNoun}, los productos, el peso, las dimensiones y el destino, y se confirma contigo antes de pagar.`,
          ),
        ],
      },
      {
        heading: 'Paquetería y plazos',
        pending: 'Paquetería que se usa, tiempo de preparación y tiempo estimado de entrega.',
      },
      {
        heading: 'Seguimiento',
        pending: 'Si se comparte número de guía y por qué medio.',
      },
      {
        heading: 'Paquetes perdidos, dañados o devueltos',
        pending: 'Qué hacer y quién responde en cada caso.',
      },
    ],
  },

  [ROUTES.devoluciones]: {
    title: 'Cambios, devoluciones y cancelaciones',
    lead: 'Qué hacer si necesitas cambiar o cancelar tu pedido.',
    sections: [
      {
        heading: 'Cancelaciones',
        pending: 'Hasta cuándo se puede cancelar un pedido y cómo se reembolsa.',
      },
      {
        heading: 'Cambios y devoluciones',
        pending: 'Casos en los que se aceptan, plazo para solicitarlos y estado en que debe llegar el producto.',
      },
      {
        heading: `${BRAND.productNounPlural} con Carta natal o dedicatoria`,
        pending: 'Si los productos preparados con datos de una persona admiten cambio o devolución.',
      },
      {
        heading: 'Cómo solicitarlo',
        pending: 'Medio de contacto y datos que hay que enviar.',
      },
    ],
  },
}

/** Orden de los enlaces legales en el pie de página. */
export const LEGAL_LINKS = [
  { route: ROUTES.privacidad, label: 'Aviso de Privacidad' },
  { route: ROUTES.terminos, label: 'Términos y Condiciones' },
  { route: ROUTES.entregas, label: 'Envíos y entregas' },
  { route: ROUTES.devoluciones, label: 'Cambios, devoluciones y cancelaciones' },
]

/** Secciones pendientes de todas las páginas: el aviso de `npm run build` las cuenta. */
export const legalPending = () =>
  Object.values(LEGAL_PAGES).flatMap((page) => page.sections.filter((s) => s.pending).map((s) => `${page.title} → ${s.heading}`))
