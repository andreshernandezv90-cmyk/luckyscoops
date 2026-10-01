/**
 * Acceso seguro a localStorage / sessionStorage: en modo privado o con el
 * almacenamiento bloqueado, el sitio sigue funcionando sin recordar datos.
 */
function safe(storageName) {
  return {
    read(key, fallback) {
      try {
        const raw = window[storageName].getItem(key)
        return raw === null ? fallback : JSON.parse(raw)
      } catch {
        return fallback
      }
    },
    write(key, value) {
      try {
        window[storageName].setItem(key, JSON.stringify(value))
      } catch {
        /* sin almacenamiento disponible */
      }
    },
  }
}

export const local = safe('localStorage')
export const session = safe('sessionStorage')
