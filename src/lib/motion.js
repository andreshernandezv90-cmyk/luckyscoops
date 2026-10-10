/**
 * Guiones de movimiento (sin React): tiempos y fotogramas de las animaciones
 * principales. Los componentes solo los leen, así se pueden ajustar y probar
 * en un solo lugar.
 *
 * Convenciones:
 *   - duraciones en segundos (como Motion) salvo donde dice `ms`;
 *   - `times` va de 0 a 1 y tiene un valor por fotograma;
 *   - `ease` tiene un valor por tramo (fotogramas − 1).
 */

/* ---------------------------------------------------------------------------
 * Abrir y cerrar el Grimorio (BookCover)
 * ------------------------------------------------------------------------- */

/**
 * Abrir: anticipación (el libro se asienta y la tapa apenas se despega),
 * arranque lento, aceleración, pequeña sobrepasada y asentamiento.
 * Ángulos en grados (rotateY de la tapa: 0 cerrada, −160 abierta).
 */
export const BOOK_OPEN = {
  duration: 1.15,
  delay: 0,
  times: [0, 0.18, 0.32, 0.62, 0.86, 1],
  ease: [
    [0.3, 0, 0.4, 1],
    [0.4, 0, 0.6, 1],
    [0.55, 0, 0.9, 0.7],
    [0.15, 0.6, 0.35, 1],
    [0.4, 0, 0.3, 1],
  ],
  cover: [0, -6, -14, -112, -168, -160],
  bookY: [0, 3, 1, -4, -1, 0],
  bookX: ['0%', '0%', '0%', '1.5%', '3%', '3%'],
  bookScale: [1, 0.99, 0.995, 1.012, 1.006, 1],
  shadow: [1, 0.97, 1, 1.35, 1.7, 1.65],
  shadowX: ['0%', '0%', '0%', '-12%', '-26%', '-25%'],
  /** Sombra que la tapa proyecta sobre la primera página. */
  pageShade: [1, 0.95, 0.82, 0.3, 0.04, 0],
  /** Hojas sueltas que el aire levanta un poco. */
  leafA: [0, 0, 0, -30, -10, 0],
  leafB: [0, 0, 0, -8, -20, 0],
  /** Brillo que recorre el cuero y el oro mientras la tapa se levanta. */
  glint: ['-110%', '-110%', '-40%', '110%', '110%', '110%'],
  frontShade: [0, 0.03, 0.08, 0.55, 0.6, 0.6],
  insideShade: [0.7, 0.7, 0.7, 0.5, 0.12, 0],
}

/** Cerrar (pedido completado): la tapa cae por su peso y rebota apenas al tocar las páginas. */
export const BOOK_CLOSE = {
  duration: 1,
  delay: 0.25,
  times: [0, 0.14, 0.5, 0.82, 0.92, 1],
  ease: [
    [0.3, 0, 0.5, 1],
    [0.5, 0, 0.9, 0.5],
    [0.6, 0, 1, 1],
    [0.2, 0.8, 0.4, 1],
    [0.5, 0, 0.5, 1],
  ],
  cover: [-160, -154, -70, 0, -4, 0],
  bookY: [0, 0, -2, 3, 0, 0],
  bookX: ['0%', '0%', '0%', '0%', '0%', '0%'],
  bookScale: [1, 1, 1, 0.99, 1.003, 1],
  shadow: [1.65, 1.6, 1.3, 1, 1, 1],
  shadowX: ['-25%', '-24%', '-12%', '0%', '0%', '0%'],
  pageShade: [0, 0, 0.3, 0.95, 1, 1],
  leafA: [0, 0, -14, 0, 0, 0],
  leafB: [0, 0, -6, -2, 0, 0],
  glint: ['110%', '110%', '110%', '20%', '-110%', '-110%'],
  frontShade: [0.6, 0.6, 0.55, 0.05, 0, 0],
  insideShade: [0, 0.1, 0.5, 0.7, 0.7, 0.7],
}

/** Tiempo que la portada espera antes de navegar al Grimorio (ms). */
export const BOOK_OPEN_NAVIGATE_MS = Math.round((BOOK_OPEN.delay + BOOK_OPEN.duration) * 1000) + 80

/* ---------------------------------------------------------------------------
 * Pasar página del Grimorio (PageTurnTransition)
 * ------------------------------------------------------------------------- */

export const PAGE_TURN = {
  /** Libro abierto (dos páginas): la hoja cruza el lomo. */
  duration: 0.68,
  /** Celular (una página): la hoja gira menos y se desvanece. */
  compactDuration: 0.52,
  /** El contenido viejo se apaga mientras la hoja lo cubre (en celular, 60 % de esto). */
  exit: 0.3,
  /** Movimiento reducido: solo un fundido. */
  fade: 0.2,
}

/**
 * Qué transición usar al pasar de página.
 *   direction  1 avanzar · −1 retroceder
 *   compact    pantalla angosta (una sola página visible)
 *   reduce     prefers-reduced-motion
 * Devuelve { mode: 'fade' | 'leaf' | 'flip', duration, origin, from, to, revealAt }
 *   origin    lado del lomo sobre el que gira la hoja
 *   revealAt  fracción de la animación en la que aparece el contenido nuevo
 */
export function pageTurnPlan(direction, { compact = false, reduce = false } = {}) {
  const forward = direction >= 0
  if (reduce) return { mode: 'fade', duration: PAGE_TURN.fade, forward, revealAt: 0 }
  if (compact) {
    return {
      mode: 'flip',
      duration: PAGE_TURN.compactDuration,
      forward,
      // En celular el lomo queda a la izquierda de la única página visible.
      // Avanzar: la hoja (que cubre la página) se levanta y deja ver la nueva.
      // Retroceder: la hoja regresa desde el lomo, cubre la página y se desvanece.
      origin: 'left',
      from: forward ? 0 : -100,
      to: forward ? -100 : 0,
      revealAt: forward ? 0.25 : 0.7,
    }
  }
  return {
    mode: 'leaf',
    duration: PAGE_TURN.duration,
    forward,
    // La hoja derecha gira sobre su borde izquierdo (el lomo) y viceversa.
    origin: forward ? 'left' : 'right',
    from: 0,
    to: forward ? -180 : 180,
    revealAt: 0.5,
  }
}

/** Fotogramas de la hoja que cruza el libro: se levanta, se curva, cruza el centro y se asienta. */
export function leafKeyframes(forward) {
  const s = forward ? -1 : 1
  return {
    times: [0, 0.12, 0.5, 0.82, 1],
    rotateY: [0, s * 18, s * 90, s * 168, s * 180],
    // La hoja se arquea (más angosta y sesgada) mientras está de pie.
    scaleX: [1, 0.97, 0.86, 0.96, 1],
    skewY: [0, s * -1.5, 0, s * 1.2, 0],
    opacity: [0, 1, 1, 1, 0],
    frontShade: [0, 0.08, 0.45, 0.45, 0.45],
    backShade: [0.45, 0.45, 0.45, 0.12, 0],
    spine: [0, 0.55, 0.75, 0.4, 0],
  }
}

/* ---------------------------------------------------------------------------
 * Ritual del caldero
 * ------------------------------------------------------------------------- */

/**
 * Vuelo con peso de un frasco: anticipación (se agacha), elevación,
 * arco hacia el caldero, pequeña sobrepasada y estabilización.
 * `from` y `to` son puntos { x, y } del lienzo 400×400.
 */
export function arcKeyframes(from, to, { lift = 34, overshoot = 7, fromScale = 0.5, toScale = 0.95 } = {}) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  // Punto alto del arco: sobre el tramo, más arriba que ambos extremos.
  const apex = { x: from.x + dx * 0.55, y: Math.min(from.y, to.y) - lift }
  const round = (n) => Math.round(n * 10) / 10
  return {
    times: [0, 0.14, 0.34, 0.66, 0.84, 1],
    x: [from.x, from.x, round(from.x + dx * 0.18), round(apex.x), round(to.x + ux * overshoot), to.x].map(round),
    y: [from.y, from.y + 5, round(from.y - lift * 0.6), round(apex.y), round(to.y + uy * overshoot), to.y].map(round),
    scale: [fromScale, fromScale * 0.94, fromScale * 1.12, toScale * 1.04, toScale, toScale].map(round),
    // Se inclina un poco hacia el lado al que viaja y se endereza al llegar.
    rotate: [0, Math.sign(dx) * -4, Math.sign(dx) * 8, Math.sign(dx) * 6, Math.sign(dx) * -3, 0],
    ease: ['easeOut', [0.3, 0, 0.6, 1], [0.4, 0, 0.6, 1], [0.3, 0.6, 0.4, 1], [0.4, 0, 0.3, 1]],
  }
}

/**
 * Recorrido de la cuchara al revolver: entra al líquido, recorre una elipse
 * (en perspectiva) con resistencia, da una pequeña vuelta final y sale un poco.
 * Coordenadas relativas a la posición de reposo de la cuchara.
 */
export function stirKeyframes({ rx = 34, ry = 7.5, turns = 1.15, samples = 14 } = {}) {
  const smooth = (u) => u * u * (3 - 2 * u)
  const x = [0, 2]
  const y = [0, 7]
  const rotate = [0, 3]
  const times = [0, 0.1]
  const cx = -6
  const cy = 5
  // Vuelta principal: arranca despacio (empuja el líquido) y termina suave.
  for (let k = 0; k <= samples; k++) {
    const u = k / samples
    const a = smooth(u) * turns * Math.PI * 2
    x.push(cx + Math.cos(a) * rx)
    y.push(cy + Math.sin(a) * ry)
    rotate.push(Math.sin(a) * 7)
    times.push(0.12 + u * 0.66)
  }
  // Pequeña vuelta final, más cerrada.
  const end = turns * Math.PI * 2
  for (let k = 1; k <= 4; k++) {
    const a = end + (k / 4) * Math.PI * 0.6
    x.push(cx + Math.cos(a) * rx * 0.45)
    y.push(cy + Math.sin(a) * ry * 0.45)
    rotate.push(Math.sin(a) * 4)
    times.push(0.78 + (k / 4) * 0.1)
  }
  // Sale parcialmente del líquido (gotea) y vuelve al reposo.
  x.push(0, 0)
  y.push(-14, 0)
  rotate.push(-3, 0)
  times.push(0.94, 1)
  const round = (n) => Math.round(n * 10) / 10
  return { x: x.map(round), y: y.map(round), rotate: rotate.map(round), times: times.map((t) => Math.round(t * 1000) / 1000) }
}

/** Duración visual de la cuchara al revolver (s). Puede continuar durante el paso siguiente. */
export const STIR_SECONDS = 0.95

/* ---------------------------------------------------------------------------
 * Revelación (Capítulo VII)
 * ------------------------------------------------------------------------- */

/**
 * Guion de la revelación. Cada fase dura poco y todo se puede saltar.
 *   hush    el caldero baja su actividad: un breve silencio visual
 *   glow    nace una luz desde dentro del líquido
 *   dip     la cuchara baja despacio y el líquido reacciona
 *   lift    la cuchara sube con una cucharada brillante; caen gotas
 *   summon  la Scoop se invoca sobre la cuchara, se abre el halo y salen partículas
 *   name    aparece el nombre; se deja disfrutar antes de mostrar la compra
 */
export const REVEAL_STEPS = [
  { phase: 'hush', duration: 420 },
  { phase: 'glow', duration: 520 },
  { phase: 'dip', duration: 700 },
  { phase: 'lift', duration: 820 },
  { phase: 'summon', duration: 950 },
  { phase: 'name', duration: 650 },
]

const REVEAL_ORDER = REVEAL_STEPS.map((s) => s.phase).concat('reveal')

/** ¿La fase `phase` ya llegó a `target` (o la pasó)? */
export const reachedPhase = (phase, target) => REVEAL_ORDER.indexOf(phase) >= REVEAL_ORDER.indexOf(target)

/**
 * Estado del escenario en cada fase de la revelación.
 * `reveal` es el estado final (también al saltar o con movimiento reducido).
 */
export function revealScene(phase) {
  const at = (target) => reachedPhase(phase, target)
  return {
    activity: phase === 'hush' ? 'idle' : at('summon') ? 'simmer' : at('glow') ? 'boil' : 'simmer',
    innerGlow: at('reveal') ? 0.3 : at('summon') ? 0.45 : at('glow') ? 0.8 : 0,
    spoon: phase === 'dip' ? 'dip' : at('lift') ? 'lift' : 'rest',
    spoonful: at('lift'),
    drips: phase === 'lift',
    scoop: at('summon'),
    halo: at('summon'),
    name: at('name'),
  }
}

export const revealDuration = () => REVEAL_STEPS.reduce((sum, s) => sum + s.duration, 0)
