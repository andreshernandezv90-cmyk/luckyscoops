import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { calculateUnitPrice, cartTotals, isValidItem, itemKey, normalizeExtras, productName } from '../lib/pricing.js'
import { local, session } from '../lib/storage.js'

/**
 * Estado global de la tienda.
 *
 * builder: lo que la persona está preparando en el grimorio
 *   intention · size · extras · quantity · currentChapter · animationState
 * cart:    líneas del carrito (se guarda en localStorage)
 * lastOrder: el último pedido confirmado (para la pantalla final)
 *
 * El precio no se guarda: se deriva siempre de la tabla central de precios.
 */

export const CHAPTER = { INTENCION: 0, TAMANO: 1, INGREDIENTES: 2, PREPARACION: 3, REVELACION: 4 }

/** idle → playing → done (o skipped, que cuenta como terminado). */
export const ANIMATION = { IDLE: 'idle', PLAYING: 'playing', DONE: 'done' }

const EMPTY_BUILDER = {
  intention: null,
  size: null,
  extras: [],
  quantity: 1,
  currentChapter: CHAPTER.INTENCION,
  animationState: ANIMATION.IDLE,
}

const CART_KEY = 'ls-cart-v1'
const ORDER_KEY = 'ls-last-order-v1'
const BUILDER_KEY = 'ls-builder-v1'

function initState() {
  const cart = local.read(CART_KEY, [])
  const saved = session.read(BUILDER_KEY, null)
  let builder = saved ? { ...EMPTY_BUILDER, ...saved } : EMPTY_BUILDER
  // Un ritual interrumpido por una recarga vuelve a empezar.
  if (builder.animationState === ANIMATION.PLAYING) builder = { ...builder, animationState: ANIMATION.IDLE }
  if (!canEnterChapter(builder, builder.currentChapter)) builder = { ...builder, currentChapter: CHAPTER.INTENCION }
  return {
    builder,
    cart: Array.isArray(cart) ? cart.filter(isValidItem) : [],
    lastOrder: local.read(ORDER_KEY, null),
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
    case CHAPTER.PREPARACION:
      return Boolean(builder.intention && builder.size)
    case CHAPTER.REVELACION:
      return Boolean(builder.intention && builder.size && builder.animationState === ANIMATION.DONE)
    default:
      return false
  }
}

/** Cualquier cambio en la receta obliga a repetir el ritual. */
const changeRecipe = (builder, patch) => ({ ...builder, ...patch, animationState: ANIMATION.IDLE })

function builderReducer(builder, action) {
  switch (action.type) {
    case 'setIntention':
      return changeRecipe(builder, { intention: action.id })
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
        size: action.item.size,
        extras: normalizeExtras(action.item.extras),
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
  useEffect(() => local.write(ORDER_KEY, state.lastOrder), [state.lastOrder])
  useEffect(() => session.write(BUILDER_KEY, state.builder), [state.builder])

  const { builder } = state
  const price = calculateUnitPrice(builder)
  const name = productName(builder)
  const totals = useMemo(() => cartTotals(state.cart), [state.cart])

  const actions = useMemo(
    () => ({
      setIntention: (id) => dispatch({ type: 'setIntention', id }),
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
      quantity: builder.quantity,
    })
  }, [actions, builder, name])

  const value = useMemo(
    () => ({
      builder,
      price,
      total: price === null ? null : price * builder.quantity,
      name,
      cart: state.cart,
      totals,
      lastOrder: state.lastOrder,
      actions,
      addBuilderToCart,
    }),
    [builder, price, name, state.cart, totals, state.lastOrder, actions, addBuilderToCart],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop debe usarse dentro de <ShopProvider>')
  return ctx
}
