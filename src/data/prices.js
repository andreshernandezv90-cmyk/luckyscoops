/**
 * TABLA CENTRAL DE PRECIOS (MXN).
 *
 * Es el único lugar donde viven los montos. Intenciones, tamaños, extras,
 * productos preparados y envío leen sus precios de aquí, así que para subir
 * o bajar un precio no hace falta tocar ningún componente.
 *
 * precio unitario = base del tamaño + ajuste de la intención + suma de extras
 */
export const PRICES = {
  /** Precio base de cada tamaño. */
  sizes: {
    aprendiz: 149,
    hechicera: 249,
    gran_bruja: 389,
  },

  /** Ajuste opcional por intención (positivo o negativo). 0 = sin cambio. */
  intentions: {
    amor: 0,
    proteccion: 0,
    abundancia: 0,
    limpieza: 0,
  },

  /** Precio adicional de cada ingrediente extra. */
  extras: {
    cristal: 59,
    amuleto: 69,
    video: 99,
    regalo: 45,
  },

  /** Descuento fijo (en pesos) de algunas Scoops preparadas. */
  productDiscounts: {
    'luna-de-miel': 30,
    'escudo-del-hogar': 0,
    'cosecha-dorada': 40,
    'agua-de-luna': 0,
  },

  shipping: {
    /** Envío a domicilio a todo México. */
    standard: 99,
    /** A partir de este subtotal el envío es gratis. */
    freeFrom: 799,
    /** Recoger en el taller. */
    pickup: 0,
  },
}
