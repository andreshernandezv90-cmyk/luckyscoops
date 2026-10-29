import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import {
  calculateUnitPrice,
  cartTotals,
  includedExtras,
  isValidItem,
  itemKey,
  normalizeDedication,
  normalizeExtras,
  productName,
  recipeTitle,
} from '../lib/pricing.js'
import { local, session } from '../lib/storage.js'

/**
 * Estado global de la tienda.
 *
 * builder: lo que la persona está preparando en el grimorio
 *   intention · size · extras · dedication · quantity · currentChapter · animationState
 * cart:    líneas del carrito (se guarda en localStorage)
 * lastOrder: el último pedido confirmado (para la pantalla final; solo sessionStorage)
 *
 * El precio no se guarda: se deriva siempre de la tabla central de precios.
 *
 * Los datos de la Carta natal (nombre completo y fecha de nacimiento) no viven
 * aquí: se piden en el Checkout y solo viajan en el pedido (sessionStorage).
 */

export const CHAPTER = {
  INTENCION: 0,
  TAMANO: 1,
  INGREDIENTES: 2,
  DEDICATORIA: 3,
  PREPARACION: 4,
  REVELACION: 5,
}

/** idle → playing → done (o skipped, que cuenta como terminado). */
export const ANIMATION = { IDLE: 'idle', PLAYING: 'playing', DONE: 'done' }

const EMPTY_BUILDER = {
  intention: null,
  size: null,
  extras: [],
  /** Capítulo IV: para quién es y dedicatoria opcional. */
  dedication: { forWhom: 'me', message: '' },
  quantity: 1,
  currentChapter: CHAPTER.INTENCION,
  animationState: ANIMATION.IDLE,
}

const CART_KEY = 'bs-cart-v1'
/**
 * El último pedido lleva datos personales (nombre, teléfono, correo, dirección,
 * notas). Se guarda en sessionStorage: sobrevive a una recarga de la pantalla de
 * confirmación y se borra al cerrar la pestaña.
 */
const ORDER_KEY = 'bs-last-order-v2'
/** Versión anterior, guardada en localStorage sin fecha de caducidad: se borra al cargar. */
const LEGACY_ORDER_KEY = 'bs-last-order-v1'
/**
 * v2: el Grimorio pasó de siete a seis capítulos (sin «Personaliza»). Una receta
 * guardada con la numeración anterior abriría el capítulo equivocado: se descarta.
 */
const BUILDER_KEY = 'bs-builder-v2'
const LEGACY_BUILDER_KEY = 'bs-builder-v1'

/** Solo los campos que existen hoy: un dato guardado por una versión anterior no llega al pedido. */
const pickBuilder = ({ intention, size, extras, dedication, quantity, currentChapter, animationState }) => ({
  ...EMPTY_BUILDER,
  ...(intention !== undefined && { intention }),
  ...(size !== undefined && { size }),
  extras: normalizeExtras(extras, size),
  dedication: { ...EMPTY_BUILDER.dedication, ...dedication },
  ...(quantity !== undefined && { quantity }),
  ...(currentChapter !== undefined && { currentChapter }),
  ...(animationState !== undefined && { animationState }),
})

/** Línea del carrito con solo los campos vigentes (sin el antiguo «enfoque»). */
function cartLine(item) {
  const line = {
    productId: item.productId ?? null,
    name: item.name,
    intention: item.intention,
    size: item.size,
    extras: normalizeExtras(item.extras, item.size),
    dedication: normalizeDedication(item.dedication),
    quantity: clampQuantity(item.quantity ?? 1),
  }
  return { ...line, key: itemKey(line) }
}

function initState() {
  local.remove(LEGACY_ORDER_KEY)
  session.remove(LEGACY_BUILDER_KEY)
  const cart = local.read(CART_KEY, [])
  const saved = session.read(BUILDER_KEY, null)
  let builder = saved && typeof saved === 'object' ? pickBuilder(saved) : EMPTY_BUILDER
  // Un ritual interrumpido por una recarga vuelve a empezar.
  if (builder.animationState === ANIMATION.PLAYING) builder = { ...builder, animationState: ANIMATION.IDLE }
  if (!canEnterChapter(builder, builder.currentChapter)) builder = { ...builder, currentChapter: CHAPTER.INTENCION }
  return {
    builder,
    cart: Array.isArray(cart) ? mergeLines(cart.filter(isValidItem).map(cartLine)) : [],
    lastOrder: session.read(ORDER_KEY, null),
  }
}

/** ¿Se puede abrir este capítulo con lo elegido hasta ahora? */
export function canEnterChapter(builder, chapter) {
  switch (chapter) {
    case CHAPTER.INTENCION:
      return true
    case CHAPTER.TAMANO:
      return Boolean(builder.intention)
    case CHAPTER.INGREDIENTES:
    case CHAPTER.DEDICATORIA:
    case CHAPTER.PREPARACION:
      return Boolean(builder.intention && builder.size)
    case CHAPTER.REVELACION:
      return Boolean(builder.intention && builder.size && builder.animationState === ANIMATION.DONE)
    default:
      return false
  }
}

/** Cambiar intención, tamaño o extras obliga a repetir el ritual (cambia el caldero). */
const changeRecipe = (builder, patch) => ({ ...builder, ...patch, animationState: ANIMATION.IDLE })

function builderReducer(builder, action) {
  switch (action.type) {
    case 'setIntention':
      return changeRecipe(builder, { intention: action.id })
    // La dedicatoria no cambia el caldero: no hace falta repetir el ritual.
    case 'setDedication':
      return { ...builder, dedication: { ...builder.dedication, ...action.patch } }
    // Un extra que el nuevo tamaño incluye deja de cobrarse; al volver a otro
    // tamaño no reaparece: solo queda si la persona lo vuelve a añadir.
    case 'setSize':
      return changeRecipe(builder, { size: action.id, extras: normalizeExtras(builder.extras, action.id) })
    case 'toggleExtra': {
      // Lo que el tamaño incluye no se puede quitar ni añadir aparte.
      if (includedExtras(builder.size).includes(action.id)) return builder
      const has = builder.extras.includes(action.id)
      const extras = has ? builder.extras.filter((e) => e !== action.id) : [...builder.extras, action.id]
      return changeRecipe(builder, { extras: normalizeExtras(extras, builder.size) })
    }
    case 'setQuantity':
      return { ...builder, quantity: clampQuantity(action.quantity) }
    case 'goToChapter':
      return canEnterChapter(builder, action.chapter) ? { ...builder, currentChapter: action.chapter } : builder
    case 'setAnimation':
      return { ...builder, animationState: action.state }
    case 'loadRecipe':
      return {
        ...EMPTY_BUILDER,
        intention: action.recipe.intention ?? null,
        size: action.recipe.size ?? null,
        extras: normalizeExtras(action.recipe.extras, action.recipe.size),
        currentChapter: action.chapter ?? CHAPTER.INTENCION,
      }
    case 'resetBuilder':
      return EMPTY_BUILDER
    default:
      return builder
  }
}

const clampQuantity = (q) => Math.min(20, Math.max(1, Math.round(Number(q)) || 1))

/** Junta las líneas con la misma clave sumando cantidades, en el orden en que llegaron. */
function mergeLines(lines) {
  const merged = []
  for (const line of lines) {
    const existing = merged.find((i) => i.key === line.key)
    if (existing) existing.quantity = clampQuantity(existing.quantity + line.quantity)
    else merged.push({ ...line })
  }
  return merged
}

function reducer(state, action) {
  switch (action.type) {
    case 'addToCart':
      return { ...state, cart: mergeLines([...state.cart, cartLine(action.item)]) }
    case 'updateQuantity':
      return {
        ...state,
        cart: state.cart.map((i) => (i.key === action.key ? { ...i, quantity: clampQuantity(action.quantity) } : i)),
      }
    case 'removeItem':
      return { ...state, cart: state.cart.filter((i) => i.key !== action.key) }
    case 'orderPlaced':
      return { ...state, cart: [], lastOrder: action.order, builder: EMPTY_BUILDER }
    default:
      return { ...state, builder: builderReducer(state.builder, action) }
  }
}

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)

  useEffect(() => local.write(CART_KEY, state.cart), [state.cart])
  useEffect(() => session.write(ORDER_KEY, state.lastOrder), [state.lastOrder])
  useEffect(() => session.write(BUILDER_KEY, state.builder), [state.builder])

  const { builder } = state
  const price = calculateUnitPrice(builder)
  const name = productName(builder)
  const title = recipeTitle(builder)
  const totals = useMemo(() => cartTotals(state.cart), [state.cart])

  const actions = useMemo(
    () => ({
      setIntention: (id) => dispatch({ type: 'setIntention', id }),
      setDedication: (patch) => dispatch({ type: 'setDedication', patch }),
      setSize: (id) => dispatch({ type: 'setSize', id }),
      toggleExtra: (id) => dispatch({ type: 'toggleExtra', id }),
      setQuantity: (quantity) => dispatch({ type: 'setQuantity', quantity }),
      goToChapter: (chapter) => dispatch({ type: 'goToChapter', chapter }),
      setAnimation: (animationState) => dispatch({ type: 'setAnimation', state: animationState }),
      loadRecipe: (recipe, chapter) => dispatch({ type: 'loadRecipe', recipe, chapter }),
      resetBuilder: () => dispatch({ type: 'resetBuilder' }),
      addToCart: (item) => dispatch({ type: 'addToCart', item }),
      updateQuantity: (key, quantity) => dispatch({ type: 'updateQuantity', key, quantity }),
      removeItem: (key) => dispatch({ type: 'removeItem', key }),
      orderPlaced: (order) => dispatch({ type: 'orderPlaced', order }),
    }),
    [],
  )

  /** Agrega al carrito la Scoop que se preparó en el grimorio. */
  const addBuilderToCart = useCallback(() => {
    actions.addToCart({
      name,
      intention: builder.intention,
      size: builder.size,
      extras: builder.extras,
      dedication: builder.dedication,
      quantity: builder.quantity,
    })
  }, [actions, builder, name])

  const value = useMemo(
    () => ({
      builder,
      price,
      total: price === null ? null : price * builder.quantity,
      name,
      title,
      cart: state.cart,
      totals,
      lastOrder: state.lastOrder,
      actions,
      addBuilderToCart,
    }),
    [builder, price, name, title, state.cart, totals, state.lastOrder, actions, addBuilderToCart],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop debe usarse dentro de <ShopProvider>')
  return ctx
}
