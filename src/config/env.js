/**
 * Entorno de ejecución.
 *
 * SHOW_PENDING: true solo con `npm run dev`. Las marcas "PENDIENTE" y los
 * avisos de demostración ayudan a completar el sitio, pero no deben verse en
 * la versión publicada (`npm run build`). En las pruebas (node --test) es false.
 */
export const SHOW_PENDING = Boolean(import.meta.env?.DEV)
