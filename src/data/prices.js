/**
 * TABLA CENTRAL DE PRECIOS (MXN).
 *
 * Es el único lugar donde viven los montos. Intenciones, tamaños, extras,
 * Scoops preparadas y envío leen sus precios de aquí.
 *
 * precio por Scoop = base del tamaño + ajuste de la intención + suma de extras
 */
export const PRICES = {
  /**
   * TODO / PENDIENTE: precios reales.
   * Mientras sea true, el sitio muestra un aviso discreto de "precios de
   * demostración". Cámbialo a false cuando escribas los precios definitivos.
   */
  areDemo: true,

  /** Precio base de cada tamaño (demostración). */
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

  /**
   * Precio adicional de cada ingrediente extra (demostración).
   * Un precio 0 se muestra como "Sin costo".
   *
   * TODO / PENDIENTE: precio de la Carta natal para Aprendiz y Hechicera. Mientras
   * sea null se muestra "Precio por confirmar" y no se suma al total. Con Gran
   * Bruja viene incluida y nunca se cobra (ver sizes.js → includedExtras).
   */
  extras: {
    cristal: 59,
    amuleto: 69,
    carta_natal: null,
    regalo: 45,
  },

  /** Descuento fijo (en pesos) de algunas Scoops preparadas (demostración). */
  productDiscounts: {
    'corazon-propio': 0,
    'escudo-del-hogar': 0,
    'buena-fortuna': 0,
    'nuevo-comienzo': 0,
  },

  /**
   * Envíos a toda la República Mexicana.
   *
   * TODO / PENDIENTE: tarifas reales. El costo dependerá del tamaño de la
   * Scoop, los productos, el peso, las dimensiones y el destino. Mientras un
   * rango tenga `price: null`, el envío se muestra como "por cotizar" y no se
   * suma al total. Ver src/lib/shipping.js para la lógica de cálculo.
   */
  shipping: {
    tiers: {
      pequeno: { label: 'Envío pequeño', price: null },
      mediano: { label: 'Envío mediano', price: null },
      grande: { label: 'Envío grande', price: null },
    },
  },
}
