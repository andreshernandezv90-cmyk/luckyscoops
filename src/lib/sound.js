import { local } from './storage.js'

/**
 * Efectos de sonido opcionales y muy sutiles.
 *
 * - Empiezan APAGADOS. La persona los activa con el botón "Sonido" del
 *   encabezado y la preferencia se recuerda en este navegador.
 * - No hay música de fondo ni sonido automático al cargar.
 * - Mientras no existan audios definitivos, cada efecto se sintetiza con
 *   Web Audio (unos milisegundos, volumen bajo). Para usar archivos reales,
 *   ponlos en public/sounds/ y escribe su ruta en SOUND_FILES.
 */

/** TODO / PENDIENTE: audios definitivos. Ejemplo: pageTurn: './sounds/pasar-pagina.mp3' */
export const SOUND_FILES = {
  bookOpen: null,
  pageTurn: null,
  bottle: null,
  pour: null,
  bubble: null,
  spoon: null,
  splash: null,
  select: null,
  reveal: null,
}

export const SOUND_NAMES = Object.keys(SOUND_FILES)

const STORAGE_KEY = 'bs-sound-v1'
const VOLUME = 0.22

let enabled = typeof window !== 'undefined' ? local.read(STORAGE_KEY, false) === true : false
const listeners = new Set()
let ctx = null
const fileCache = new Map()

export const isSoundOn = () => enabled

export function setSoundOn(value) {
  enabled = Boolean(value)
  local.write(STORAGE_KEY, enabled)
  listeners.forEach((fn) => fn(enabled))
  // Un pequeño destello confirma que el sonido quedó activo.
  if (enabled) playSound('select')
}

export function subscribeSound(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function audioContext() {
  if (ctx) return ctx
  const AC = typeof window !== 'undefined' ? window.AudioContext ?? window.webkitAudioContext : null
  if (!AC) return null
  try {
    ctx = new AC()
  } catch {
    ctx = null
  }
  return ctx
}

/** Reproduce un efecto (si el sonido está activado). Nunca lanza errores. */
export function playSound(name) {
  if (!enabled) return
  try {
    const file = SOUND_FILES[name]
    if (file) {
      let audio = fileCache.get(file)
      if (!audio) {
        audio = new Audio(file)
        audio.volume = VOLUME * 2
        fileCache.set(file, audio)
      }
      audio.currentTime = 0
      audio.play().catch(() => {})
      return
    }
    const ac = audioContext()
    if (!ac) return
    if (ac.state === 'suspended') ac.resume().catch(() => {})
    SYNTHS[name]?.(ac, ac.currentTime + 0.01)
  } catch {
    /* sin audio disponible */
  }
}

/* ---------- Síntesis: tonos y ruido filtrado, todo muy breve ---------- */

function envelope(ac, t, { attack = 0.005, decay = 0.2, peak = VOLUME }) {
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(peak, t + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  gain.connect(ac.destination)
  return gain
}

function tone(ac, t, { freq, type = 'sine', decay = 0.3, peak = VOLUME * 0.5, glide = null }) {
  const osc = ac.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + decay)
  osc.connect(envelope(ac, t, { decay, peak }))
  osc.start(t)
  osc.stop(t + decay + 0.05)
}

let noiseBuffer = null
function noise(ac, t, { duration = 0.3, filter = 'bandpass', freq = 1200, q = 0.8, sweep = null, peak = VOLUME * 0.6, attack = 0.02 }) {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer
  const biquad = ac.createBiquadFilter()
  biquad.type = filter
  biquad.frequency.setValueAtTime(freq, t)
  if (sweep) biquad.frequency.exponentialRampToValueAtTime(sweep, t + duration)
  biquad.Q.value = q
  src.connect(biquad)
  biquad.connect(envelope(ac, t, { attack, decay: duration, peak }))
  src.start(t)
  src.stop(t + duration + attack + 0.05)
}

const SYNTHS = {
  bookOpen: (ac, t) => {
    noise(ac, t, { duration: 0.18, filter: 'lowpass', freq: 400, peak: VOLUME * 0.5 })
    noise(ac, t + 0.35, { duration: 0.6, freq: 900, sweep: 2600, q: 0.6, peak: VOLUME * 0.35, attack: 0.15 })
    tone(ac, t + 0.95, { freq: 70, decay: 0.25, peak: VOLUME * 0.4 })
  },
  pageTurn: (ac, t) => noise(ac, t, { duration: 0.32, freq: 1800, sweep: 4200, q: 0.5, peak: VOLUME * 0.35, attack: 0.08 }),
  bottle: (ac, t) => {
    tone(ac, t, { freq: 2350, decay: 0.25, peak: VOLUME * 0.25 })
    tone(ac, t + 0.004, { freq: 3520, decay: 0.18, peak: VOLUME * 0.12 })
  },
  pour: (ac, t) => noise(ac, t, { duration: 0.5, freq: 700, sweep: 420, q: 1.4, peak: VOLUME * 0.45, attack: 0.06 }),
  splash: (ac, t) => {
    noise(ac, t, { duration: 0.22, filter: 'lowpass', freq: 1400, sweep: 300, peak: VOLUME * 0.4 })
    tone(ac, t, { freq: 320, glide: 640, decay: 0.12, peak: VOLUME * 0.2 })
  },
  bubble: (ac, t) => {
    tone(ac, t, { freq: 260, glide: 720, decay: 0.09, peak: VOLUME * 0.3 })
    tone(ac, t + 0.12, { freq: 340, glide: 900, decay: 0.08, peak: VOLUME * 0.22 })
  },
  spoon: (ac, t) => noise(ac, t, { duration: 0.55, filter: 'lowpass', freq: 500, sweep: 900, q: 1.2, peak: VOLUME * 0.4, attack: 0.12 }),
  select: (ac, t) => tone(ac, t, { freq: 1568, decay: 0.35, peak: VOLUME * 0.2 }),
  reveal: (ac, t) => {
    ;[1046.5, 1318.5, 1568, 2093].forEach((freq, i) => tone(ac, t + i * 0.09, { freq, decay: 1.1 - i * 0.15, peak: VOLUME * 0.22 }))
  },
}
