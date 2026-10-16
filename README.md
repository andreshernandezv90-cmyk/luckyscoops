# Scoops de la Bruja Sabia

**Magia · Energía · Conexión**

Tienda esotérica con una experiencia central llamada **El Grimorio de la Bruja Sabia**: la persona abre el libro, recorre sus capítulos para preparar su propia **Scoop**, ve cómo su receta cae en el caldero y termina con un pedido claro y fácil de completar.

```
Portada → I Intención → II Personaliza → III Tamaño → IV Extras → V Dedicatoria
        → VI Preparación en el Caldero → VII Revelación → Tu pedido → Datos y envío → Pedido registrado
```

También hay **Scoops preparadas** que se agregan al pedido en un clic, y secciones de Significados, Videos ("Desde el Caldero de la Bruja"), Envíos y pagos, "Conoce a la Bruja Sabia", Preguntas frecuentes y Contacto.

## Cómo ejecutarlo

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # versión de producción en dist/
npm run preview   # sirve dist/ localmente
npm test          # pruebas de precios, envío, carrito, Grimorio y ritual
```

Requiere Node 18 o superior. El sitio usa rutas con `#` (`#/grimorio`, `#/carrito`…), así que `dist/` se puede publicar en cualquier hosting estático (Netlify, Vercel, GitHub Pages…).

## Datos pendientes (TODO / PENDIENTE)

El sitio **no inventa datos del negocio**. Lo que aún no existe está en `null`. Búscalo en el código con `PENDIENTE`.

- En desarrollo (`npm run dev`) se marca en la página con una etiqueta "Pendiente" y con el aviso "Precios de demostración".
- En la versión publicada (`npm run build`) esas marcas no se ven: las filas sin dato se ocultan. Solo se mantienen los estados que sí informan al cliente, como "Por cotizar" o "Por confirmar". El interruptor está en `src/config/env.js`.
- `npm run build` imprime **"ANTES DE PUBLICAR"** si falta el WhatsApp o si los precios siguen siendo de demostración. No detiene la compilación.

| Pendiente | Dónde se completa |
| --- | --- |
| Audios definitivos (opcional) | `src/lib/sound.js` → `SOUND_FILES` (archivos en `public/sounds/`) |
| WhatsApp, TikTok, Instagram, correo, horario | `src/config/brand.js` → `contact` |
| Precios reales (hoy son de demostración) | `src/data/prices.js` → precios y `areDemo: false` |
| Tarifas de envío (pequeño, mediano, grande) | `src/data/prices.js` → `shipping.tiers` y `src/lib/shipping.js` |
| Formas de pago (tarjeta, transferencia, Mercado Pago, WhatsApp) | `src/lib/order.js` → `PAYMENT_METHODS` (`ready: true`) |
| Historia y fotografía de la Bruja Sabia | `src/data/about.js` |
| Significados de los productos reales | `src/data/meanings.js` |
| Videos de TikTok | `src/data/videos.js` (`tiktokId` de cada video) |
| Scoops preparadas reales | `src/data/products.js` |

En cuanto se escribe el número de WhatsApp, la pantalla final muestra el botón **Enviar mi pedido por WhatsApp** con todo el pedido ya redactado (intención, enfoque, tamaño, extras, dedicatoria, datos de envío y forma de pago preferida).

## Dónde cambiar cada cosa

| Quiero cambiar… | Archivo |
| --- | --- |
| Nombre, lema, texto de portada | `src/config/brand.js` |
| Precios | `src/data/prices.js` |
| Intenciones, sus botellas, colores y enfoques (Capítulo II) | `src/data/intentions.js` |
| Tamaños (Aprendiz, Hechicera, Gran Bruja) | `src/data/sizes.js` |
| Extras | `src/data/extras.js` |
| Recomendaciones del Grimorio (Capítulo IV) | `src/data/recommendations.js` |
| Capítulos y sus títulos | `src/data/chapters.js` |
| Preguntas frecuentes | `src/data/faq.js` |
| Logo (rutas de los archivos) | `src/config/brand.js` → `logo`, `logoMark`, `logoText` |
| Ritmo del ritual del caldero | `src/lib/ritual.js` (`STEP_MS`) |
| Apertura del libro, pase de página, vuelo de frascos, cuchara y revelación | `src/lib/motion.js` |
| Ilustración de la Scoop revelada | `src/components/ScoopReveal.jsx` |

Los precios solo existen en `src/data/prices.js`; todo lo demás los calcula con `src/lib/pricing.js`:

```
precio por Scoop = base del tamaño + ajuste de la intención + suma de extras (− descuento si es preparada)
```

## Envíos

Envíos a toda la República Mexicana. Hoy el sitio estima el **rango del paquete** (pequeño, mediano o grande) según los tamaños de Scoop del pedido y muestra el costo como **"por cotizar"**; no se suma al total hasta que exista una tarifa real. `estimateShipping()` en `src/lib/shipping.js` ya recibe el código postal para conectarlo después con tarifas reales o una paquetería.

## Pedidos y pagos: punto de integración

Hoy el pedido se prepara en el navegador y **solo le llega a la Bruja Sabia cuando la persona lo envía por WhatsApp** desde la pantalla final; **no se cobra en línea ni se piden datos de tarjeta**. Los datos del cliente del último pedido se guardan solo en `sessionStorage` (se borran al cerrar la pestaña); el carrito sigue en `localStorage` y no contiene datos de contacto. Para recibir pedidos automáticamente o cobrar en línea, reemplaza `submitOrder()` en `src/lib/order.js` por la llamada a tu backend o pasarela (Mercado Pago, Stripe…).

## Logo

Los archivos están en `public/branding/`:

| Archivo | Uso |
| --- | --- |
| `logo.svg` | Logo completo: portada del Grimorio (estampado en oro) y pie de página |
| `logo-isotipo.svg` | Luna, mano y cuchara: encabezado, marca grabada en el caldero, sello de lacre del pedido, "Déjalo en manos de la Bruja Sabia" |
| `logo-texto.svg` | Solo las letras (disponible para usos futuros) |
| `favicon.svg`, `apple-touch-icon.png` | Ícono del sitio |
| `original/` | Los dos archivos tal como se entregaron |

`BrandMark` usa cada SVG como máscara CSS, así el mismo archivo se pinta dorado, en tinta o con relieve según el lugar. Si `BRAND.logo` vuelve a `null`, el sitio usa el sigilo provisional.

## Movimiento

Todos los tiempos y fotogramas de las animaciones principales están en `src/lib/motion.js` (con pruebas en `tests/motion.test.js`):

- **Abrir el Grimorio** (`BOOK_OPEN`, ~1.15 s): anticipación, arranque lento, aceleración, pequeña sobrepasada; sombra de la tapa sobre las páginas, brillo sobre el oro y hojas que se mueven con el aire. `BOOK_CLOSE` cierra el libro al terminar el pedido.
- **Pasar página** (`pageTurnPlan`, `PageTurnTransition.jsx`): en escritorio una hoja se levanta, se curva, cruza el lomo y se asienta (0.68 s); en celular la hoja gira sobre el lomo y se desvanece; con movimiento reducido, solo un fundido.
- **Ritual**: los frascos vuelan en arco (`arcKeyframes`) y se inclinan con el líquido nivelado dentro; el chorro es SVG, el color nuevo entra desde el punto de impacto y la cuchara recorre una elipse (`stirKeyframes`). Fuego, humo, burbujas y destellos son animaciones CSS en `src/styles/motion.css`.
- **Revelación** (`REVEAL_STEPS`): silencio → luz desde el líquido → la cuchara baja → sube con una cucharada brillante → la Scoop se invoca (`ScoopReveal`) → aparece el nombre → entra la tarjeta de compra.
- **Partículas** (`ParticleBurst.jsx`): cada intención tiene su propio movimiento (corazones que flotan, runas en anillo, brillos que suben, bocanadas).

## Sonido

Opcional y **apagado por defecto**: el botón "Sonido" del encabezado lo activa y la preferencia se recuerda. No hay música de fondo. Mientras no haya audios definitivos, los efectos (página, libro, frasco, vertido, burbuja, cuchara, revelación) se sintetizan con Web Audio a volumen bajo; para usar archivos reales, escribe sus rutas en `SOUND_FILES` (`src/lib/sound.js`).

## Estructura

```
src/
  config/brand.js          Marca, lema, logo y contacto (pendientes en null)
  data/                    Catálogo, precios, enfoques, recomendaciones, significados, videos, historia
  lib/
    pricing.js             Precios, claves del carrito y totales
    shipping.js            Rango y costo de envío (pendiente de tarifas)
    ritual.js              Convierte la receta en el guion del caldero
    motion.js              Tiempos y fotogramas: libro, páginas, frascos, cuchara, revelación
    sound.js               Efectos de sonido opcionales (apagados por defecto)
    order.js               Entrega, formas de pago, registro y mensaje de WhatsApp
    router.js              Enrutador mínimo por hash
  state/ShopContext.jsx    Estado: intention, focus, size, extras, dedication, quantity,
                           currentChapter, animationState, cart, lastOrder
  components/
    Grimorio.jsx           Libro abierto, siete capítulos y navegación
    PotionSelector · FocusSelector · SizeSelector · ExtrasSelector · DedicationSelector
    PageTurnTransition.jsx Pasar página del Grimorio
    RitualAnimation.jsx    Capítulo VI (caldero)
    Revelation.jsx         Capítulo VII
    ScoopReveal.jsx        La Scoop invocada sobre la cuchara
    BrandMark.jsx          Logo (completo, isotipo o texto)
    Cauldron.jsx           Caldero en capas SVG
    Cart · Checkout · OrderComplete · OrderSummary
    home/                  Portada y secciones del inicio
    illustrations/         Botellas, sigilos, sellos, velas, cristales (todo SVG)
  styles/                  base, layout, grimorio, ritual, shop, sections, brand, motion, animations, fonts
```

## Accesibilidad y rendimiento

- Opciones con controles nativos (radios) o botones con `aria-pressed`; todo se usa con teclado.
- Al pasar de capítulo, el foco va al título nuevo; el precio y el ritual se anuncian con `aria-live`.
- `prefers-reduced-motion`: sin vuelos, giros 3D ni partículas; el libro y las páginas cambian con un fundido, y el caldero y la revelación muestran el resultado directamente. Siempre existe **Saltar animación**.
- Rendimiento: las animaciones usan `transform` y `opacity`; los ciclos continuos (fuego, humo, burbujas) son CSS y el humo usa degradados en lugar de filtros de desenfoque.
- Los videos de TikTok solo se cargan cuando la persona pulsa "Ver video".
- Sin imágenes pesadas: las ilustraciones son SVG y las tipografías (Cinzel, Cinzel Decorative, EB Garamond, licencia SIL OFL) van incluidas en `src/assets/fonts`.

## Tecnologías

React 19, Vite, CSS sin frameworks y [Motion for React](https://motion.dev).
