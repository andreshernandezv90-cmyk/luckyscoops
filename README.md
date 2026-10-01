# Lucky Scoops · Grimorio de las Scoops

Tienda esotérica artesanal escondida dentro de un grimorio. La persona abre el libro, recorre sus capítulos para preparar su propia **Scoop** (frasco de cristales, hierbas y amuletos), ve cómo sus elecciones caen en el caldero y termina con un carrito y un proceso de compra normales y claros.

```
Portada → I Intención → II Tamaño → III Ingredientes → IV Preparación (caldero) → V Revelación → Carrito → Pago → Pedido completado
```

También hay **Scoops preparadas** que se agregan al carrito en un clic, sin pasar por el ritual.

## Cómo ejecutarlo

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # versión de producción en dist/
npm run preview   # sirve dist/ localmente
npm test          # pruebas de precios, carrito y guion del ritual
```

Requiere Node 18 o superior. El sitio usa rutas con `#` (`#/grimorio`, `#/carrito`…), así que `dist/` se puede publicar en cualquier hosting estático (Netlify, Vercel, GitHub Pages, un servidor propio) sin configurar nada más.

## Dónde cambiar cada cosa

| Quiero cambiar…                                   | Archivo |
| ------------------------------------------------- | ------- |
| Nombre de la marca, título del grimorio, contacto, datos bancarios | `src/config/brand.js` |
| **Precios** (tamaños, intenciones, extras, descuentos, envío) | `src/data/prices.js` |
| Intenciones (textos, colores de poción, efectos)  | `src/data/intentions.js` |
| Tamaños (Aprendiz, Hechicera, Gran Bruja)         | `src/data/sizes.js` |
| Ingredientes extra                                | `src/data/extras.js` |
| Scoops preparadas                                 | `src/data/products.js` |
| Preguntas frecuentes                              | `src/data/faq.js` |
| Formas de entrega y de pago                       | `src/lib/order.js` |
| Ritmo del ritual (duración de cada paso)          | `src/lib/ritual.js` (`STEP_MS`) |

Los precios solo existen en `src/data/prices.js`. Todo lo demás (receta, revelación, productos, carrito, pago) los calcula con `src/lib/pricing.js`:

```
precio por Scoop = base del tamaño + ajuste de la intención + suma de extras (− descuento si es preparada)
```

Si cambia el nombre de la marca, edita `src/config/brand.js` y el `<title>` por defecto de `index.html` (que de todos modos se reemplaza al cargar).

## Pagos: punto de integración

Hoy el pedido se registra en el navegador y el pago se coordina después (transferencia con CLABE, enlace de pago con tarjeta o referencia OXXO), un flujo habitual para talleres pequeños. **No se cobra en línea ni se piden datos de tarjeta.**

Para cobrar en línea, reemplaza el cuerpo de `submitOrder()` en `src/lib/order.js` por la llamada a tu backend o pasarela (Mercado Pago, Stripe, Conekta…). La pantalla de pago ya maneja el estado de envío y los errores.

## Estructura

```
src/
  config/brand.js          Marca y contacto
  data/                    Catálogo y precios (una sola fuente de verdad)
  lib/
    pricing.js             Cálculo de precios, totales y envío
    ritual.js              Convierte la receta en el guion del caldero
    order.js               Entrega, pago y registro del pedido
    router.js              Enrutador mínimo por hash
  state/ShopContext.jsx    Estado global: intention, size, extras, quantity,
                           currentChapter, animationState, cart, lastOrder
  hooks/useSequence.js     Reproduce pasos con duración (y permite saltarlos)
  components/
    Grimorio.jsx           Libro abierto, capítulos y navegación
    BookCover.jsx          Grimorio cerrado (portada y pantalla final)
    BookPage.jsx           Página de pergamino con adornos
    ChapterProgress.jsx    Indicador de capítulos
    PotionSelector.jsx     Capítulo I
    SizeSelector.jsx       Capítulo II
    ExtrasSelector.jsx     Capítulo III
    RitualAnimation.jsx    Capítulo IV (caldero)
    Revelation.jsx         Capítulo V
    Cauldron.jsx           Caldero en capas SVG: fuego, líquido, burbujas, humo, cuchara
    Recipe.jsx             Receta anotada en la página izquierda
    OrderSummary.jsx       Detalle comercial y totales
    Cart.jsx · Checkout.jsx · OrderComplete.jsx
    Header.jsx · Footer.jsx · home/…
    illustrations/         Frascos, sigilos, fases lunares, sellos, velas, cristales
  styles/                  base, layout, grimorio, ritual, shop, animations, fonts
```

Todas las ilustraciones son SVG hechos para la marca; no se usan emojis ni imágenes externas.

## Accesibilidad y movimiento

- Opciones con controles nativos (radios) o botones con `aria-pressed`, que se recorren con teclado.
- Al pasar de capítulo, el foco va al título nuevo; el precio y el avance del ritual se anuncian con regiones `aria-live`.
- Botones de al menos 44–48 px, textos importantes en serif legible y alto contraste sobre pergamino.
- `prefers-reduced-motion`: el ritual y la revelación muestran el resultado final sin animar y se desactivan las animaciones decorativas. Siempre existe **Saltar animación**.
- Si se intenta avanzar sin elegir, el botón explica qué falta en lugar de quedarse inerte.

## Tecnologías

React 19, Vite, CSS sin frameworks y [Motion for React](https://motion.dev) para las animaciones. Tipografías Cinzel, Cinzel Decorative y EB Garamond (SIL Open Font License), incluidas en `src/assets/fonts`.
