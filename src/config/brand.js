/**
 * Configuración de la marca.
 *
 * Todo el sitio lee el nombre, los textos de marca y los datos de contacto
 * desde aquí. Los datos que todavía no existen se dejan en `null` y el sitio
 * muestra un aviso "PENDIENTE" en su lugar: nunca se inventan.
 */
export const BRAND = {
  /** Nombre comercial. */
  name: 'Scoops de la Bruja Sabia',
  /** Nombre corto para espacios reducidos (encabezado en celular). */
  shortName: 'Bruja Sabia',
  /** Nombre del producto en singular y plural. */
  productNoun: 'Scoop',
  productNounPlural: 'Scoops',
  /** La experiencia interactiva. Aparece grabado en la portada del libro. */
  grimoireTitle: 'El Grimorio de la Bruja Sabia',
  /** Lema principal. */
  motto: 'Magia · Energía · Conexión',
  /** Texto de la portada. */
  heroText:
    'Abre el Grimorio y prepara una Scoop creada especialmente para ti. Elige tu intención, personaliza tu magia y deja que la Bruja Sabia prepare el resto.',
  /** Quien prepara las Scoops (se usa en textos como "Déjalo en manos de…"). */
  witch: 'la Bruja Sabia',

  /**
   * TODO / PENDIENTE: logo oficial.
   * Coloca el archivo en /public (por ejemplo public/logo.svg) y escribe aquí
   * './logo.svg'. Mientras sea null se usa el sigilo provisional.
   */
  logo: null,

  /** Prefijo de los números de pedido, p. ej. BS-1025-4821. */
  orderPrefix: 'BS',
  currency: 'MXN',
  locale: 'es-MX',

  /**
   * TODO / PENDIENTE: datos de contacto reales.
   * Escribe los valores cuando existan; mientras sean null no se muestran enlaces.
   */
  contact: {
    /** Número en formato internacional sin "+" ni espacios, p. ej. '5215500000000'. */
    whatsapp: null,
    /** Cómo se muestra el número, p. ej. '+52 55 0000 0000'. */
    whatsappDisplay: null,
    /** Usuario de TikTok sin "@". */
    tiktok: null,
    /** Usuario de Instagram sin "@" (opcional). */
    instagram: null,
    /** Correo electrónico (opcional). */
    email: null,
    /** Horario de atención (opcional). */
    hours: null,
  },
}

/** Enlaces de contacto disponibles (solo los que ya tienen dato real). */
export function contactLinks(message) {
  const { whatsapp, tiktok, instagram, email } = BRAND.contact
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return {
    whatsapp: whatsapp ? `https://wa.me/${whatsapp}${text}` : null,
    tiktok: tiktok ? `https://www.tiktok.com/@${tiktok}` : null,
    instagram: instagram ? `https://instagram.com/${instagram}` : null,
    email: email ? `mailto:${email}` : null,
  }
}
