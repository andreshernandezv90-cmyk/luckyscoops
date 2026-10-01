/**
 * Configuración de la marca.
 *
 * Todo el sitio lee el nombre, los textos de marca y los datos de contacto
 * desde aquí. Si el nombre definitivo cambia, basta con editar este archivo
 * (y el <title> por defecto de index.html, que se reemplaza al cargar).
 */
export const BRAND = {
  /** Nombre comercial completo. */
  name: 'Lucky Scoops',
  /** Nombre del producto en singular (se usa en "Scoop Gran Bruja del Amor"). */
  productNoun: 'Scoop',
  productNounPlural: 'Scoops',
  /** Título que aparece grabado en la portada del libro. */
  grimoireTitle: 'Grimorio de las Scoops',
  tagline: 'Mezclas artesanales de cristales, hierbas y amuletos preparadas para tu intención.',
  /** Prefijo de los números de pedido, p. ej. LS-1025-4821. */
  orderPrefix: 'LS',
  currency: 'MXN',
  locale: 'es-MX',
  foundedIn: 'Ciudad de México',

  contact: {
    whatsapp: '5215512345678', // Formato internacional sin "+" ni espacios (wa.me).
    whatsappDisplay: '+52 55 1234 5678',
    email: 'hola@luckyscoops.mx',
    instagram: 'luckyscoops',
    hours: 'Lunes a sábado, 10:00 a 19:00 h',
    pickupAddress: 'Calle de los Alquimistas 13, Col. Roma, CDMX',
  },

  /** Datos que se muestran tras un pedido pagado por transferencia. */
  bank: {
    bankName: 'Banco por definir',
    holder: 'Lucky Scoops',
    clabe: '000 000 0000000000 0',
  },
}

/** Mayúsculas de marca para los momentos solemnes: "TU LUCKY SCOOP HA SIDO INVOCADA". */
export const brandUpper = () => BRAND.name.toUpperCase()

/** Nombre de marca en singular, p. ej. "Lucky Scoop". */
export const brandSingular = () => BRAND.name.replace(/s$/i, '')
