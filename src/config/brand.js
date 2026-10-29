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
    'Abre el Grimorio y prepara una Scoop creada especialmente para ti. Elige tu intención, tu tamaño y tus extras, y deja que la Bruja Sabia prepare el resto.',
  /** Quien prepara las Scoops (se usa en textos como "Déjalo en manos de…"). */
  witch: 'la Bruja Sabia',

  /**
   * Logo oficial (archivos en public/branding/). Las rutas son relativas para
   * que el sitio funcione en la raíz de un dominio o en una subcarpeta.
   *   logo      logo completo: isotipo + "SCOOOPS de la Bruja Sabia"
   *   logoMark  isotipo (luna, mano y cuchara): encabezado, sellos, favicon
   *   logoText  solo el texto del logo
   * Si `logo` vuelve a ser null, el sitio usa el sigilo provisional.
   */
  logo: './branding/logo.svg',
  logoMark: './branding/logo-isotipo.svg',
  logoText: './branding/logo-texto.svg',

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
