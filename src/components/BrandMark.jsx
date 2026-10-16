import { BRAND } from '../config/brand.js'
import { BrandSigil } from './illustrations/Ornaments.jsx'

const SOURCES = {
  full: () => BRAND.logo,
  mark: () => BRAND.logoMark ?? BRAND.logo,
  text: () => BRAND.logoText ?? BRAND.logo,
}

/**
 * Dirección absoluta del archivo, resuelta contra la página.
 * Un url() relativo dentro de una variable CSS se resuelve contra la hoja de
 * estilos que la usa (en producción, dist/assets/), no contra la página: sin
 * esto el logo no carga después de `npm run build`.
 */
const absolute = (src) => new URL(src, document.baseURI).href

/**
 * Logo de la marca (decorativo: el nombre siempre está escrito al lado o en texto oculto).
 *
 * variant: 'full' (logo completo) · 'mark' (isotipo) · 'text' (solo letras)
 *
 * El archivo SVG se usa como máscara CSS, así el logo toma el color o el
 * degradado del contexto (dorado en la portada, tinta en el pergamino…)
 * sin tener una copia del archivo por cada color.
 * Mientras BRAND.logo sea null se usa el sigilo provisional.
 */
export function BrandMark({ variant = 'mark', className = '' }) {
  const src = BRAND.logo ? SOURCES[variant]?.() : null
  if (!src) return <BrandSigil className={className} />
  return (
    <span
      className={`brand-logo brand-logo--${variant} ${className}`}
      style={{ '--logo-src': `url("${absolute(src)}")` }}
      aria-hidden="true"
    />
  )
}
