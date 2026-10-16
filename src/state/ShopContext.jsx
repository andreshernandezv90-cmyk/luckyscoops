import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import {
  calculateUnitPrice,
  cartTotals,
  isValidItem,
  itemKey,
  normalizeDedication,
  normalizeExtras,
  normalizeFocus,
  productName,
  recipeTitle,
} from '../lib/pricing.js'
import { local, session } from '../lib/storage.js'

/**
 * Estado global de la tienda.
 *
 * builder: lo que la persona está preparando en el grimorio
 *   intention · focus · size · extras · dedication · quantity · currentChapter · animationState
 * cart:    líneas del carrito (se guarda en localStorage)
 * lastOrder: el último pedido confirmado (para la pantalla final; solo sessionStorage)
 *
 * El precio no se guarda: se deriva siempre de la tabla central de precios.
 */

export const CHAPTER = {
  INTENCION: 0,
  ENFOQUE: 1,
  TAMANO: 2,
  INGREDIENTES: 3,
  DEDICATORIA: 4,
  PREPARACION: 5,
  REVELACION: 6,
}

/** idle → playing → done (o skipped, que cuenta como terminado). */
export const ANIMATION = { IDLE: 'idle', PLAYING: 'playing', DONE: 'done' }

const EMPTY_BUILDER = {
  intention: null,
  /** Enfoque (Capítulo II). 'bruja' = "Déjalo en manos de la Bruja Sabia". */
  focus: null,
  size: null,
  extras: [],
  /** Capítulo V: para quién es y dedicatoria opcional. */
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
const BUILDER_KEY = 'bs-builder-v1'

function initState() {
  local.remove(LEGACY_ORDER_KEY)
  const cart = local.read(CART_KEY, [])
  const saved = session.read(BUILDER_KEY, null)
  let builder = saved ? { ...EMPTY_BUILDER, ...saved } : EMPTY_BUILDER
  // Un ritual interrumpido por una recarga vuelve a empezar.
  if (builder.animationState === ANIMATION.PLAYING) builder = { ...builder, animationState: ANIMATION.IDLE }
  if (!canEnterChapter(builder, builder.currentChapter)) builder = { ...builder, currentChapter: CHAPTER.INTENCION }
  return {
    builder,
    cart: Array.isArray(cart) ? cart.filter(isValidItem) : [],
    lastOrder: session.read(ORDER_KEY, null),
  }
}

/** ¿Se puede abrir este capítulo con lo elegido hasta ahora? */
export function canEnterChapter(builder, chapter) {
  switch (chapter) {
    case CHAPTER.INTENCION:
      return true
    case CHAPTER.ENFOQUE:
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
      // Los enfoques dependen de la intención: al cambiarla vuelve a "en manos de la Bruja Sabia".
      return changeRecipe(builder, {
        intention: action.id,
        focus: action.id === builder.intention ? builder.focus : 'bruja',
      })
    // Enfoque y dedicatoria no cambian el caldero: no hace falta repetir el ritual.
    case 'setFocus':
      return { ...builder, focus: normalizeFocus(builder.intention, action.id) }
    case 'setDedication':
      return { ...builder, dedication: { ...builder.dedication, ...action.patch } }
    case 'setSize':
      return changeRecipe(builder, { size: action.id })
    case 'toggleExtra': {
      const has = builder.extras.includes(action.id)
      const extras = has ? builder.extras.filter((e) => e !== action.id) : [...builder.extras, action.id]
      return changeRecipe(builder, { extras: normalizeExtras(extras) })
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
        focus: action.recipe.intention ? normalizeFocus(action.recipe.intention, action.recipe.focus) : null,
        size: action.recipe.size ?? null,
        extras: normalizeExtras(action.recipe.extras),
        currentChapter: action.chapter ?? CHAPTER.INTENCION,
      }
    case 'resetBuilder':
      return EMPTY_BUILDER
    default:
      return builder
  }
}

const clampQuantity = (q) => Math.min(20, Math.max(1, Math.round(Number(q)) || 1))

function reducer(state, action) {
  switch (action.type) {
    case 'addToCart': {
      const line = {
        productId: action.item.productId ?? null,
        name: action.item.name,
        intention: action.item.intention,
        focus: normalizeFocus(action.item.intention, action.item.focus),
        size: action.item.size,
        extras: normalizeExtras(action.item.extras),
        dedication: normalizeDedication(action.item.dedication),
        quantity: clampQuantity(action.item.quantity ?? 1),
      }
      const key = itemKey(line)
      const existing = state.cart.find((i) => i.key === key)
      const cart = existing
        ? state.cart.map((i) => (i.key === key ? { ...i, quantity: clampQuantity(i.quantity + line.quantity) } : i))
        : [...state.cart, { ...line, key }]
      return { ...state, cart }
    }
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
      setFocus: (id) => dispatch({ type: 'setFocus', id }),
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
      focus: builder.focus,
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
