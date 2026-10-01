import { BRAND } from '../config/brand.js'
import { BrandSigil } from './illustrations/Ornaments.jsx'

/**
 * Logo de la marca. Mientras BRAND.logo sea null se usa el sigilo provisional.
 * Cuando exista el logo oficial, basta con escribir su ruta en src/config/brand.js.
 */
export function BrandMark({ className = '' }) {
  if (BRAND.logo) {
    return <img className={`brand-logo ${className}`} src={BRAND.logo} alt="" aria-hidden="true" />
  }
  return <BrandSigil className={className} />
}
