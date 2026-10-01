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

El sitio **no inventa datos del negocio**. Lo que aún no existe está en `null` y se muestra en la página con una etiqueta "Pendiente". Búscalo en el código con `PENDIENTE`.

| Pendiente | Dónde se completa |
| --- | --- |
| Logo oficial | `src/config/brand.js` → `logo` (pon el archivo en `public/`) |
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
| Ritmo del ritual del caldero | `src/lib/ritual.js` (`STEP_MS`) |
| Fases de la revelación final | `src/components/Revelation.jsx` (`REVEAL_STEPS`, `ScoopBloom`) |

Los precios solo existen en `src/data/prices.js`; todo lo demás los calcula con `src/lib/pricing.js`:

```
precio por Scoop = base del tamaño + ajuste de la intención + suma de extras (− descuento si es preparada)
```

## Envíos

Envíos a toda la República Mexicana. Hoy el sitio estima el **rango del paquete** (pequeño, mediano o grande) según los tamaños de Scoop del pedido y muestra el costo como **"por cotizar"**; no se suma al total hasta que exista una tarifa real. `estimateShipping()` en `src/lib/shipping.js` ya recibe el código postal para conectarlo después con tarifas reales o una paquetería.

## Pedidos y pagos: punto de integración

Hoy el pedido se registra en el navegador y se envía a la Bruja Sabia por WhatsApp; **no se cobra en línea ni se piden datos de tarjeta**. Para recibir pedidos automáticamente o cobrar en línea, reemplaza `submitOrder()` en `src/lib/order.js` por la llamada a tu backend o pasarela (Mercado Pago, Stripe…).

## Revelación final

La revelación ya hace: brillo y partículas → la cuchara entra al caldero → sale una cucharada → la Scoop se revela con un halo. Para una animación más elaborada, añade fases en `REVEAL_STEPS` y reemplaza el componente `ScoopBloom` en `src/components/Revelation.jsx`; el resto del capítulo no cambia.

## Estructura

```
src/
  config/brand.js          Marca, lema, logo y contacto (pendientes en null)
  data/                    Catálogo, precios, enfoques, recomendaciones, significados, videos, historia
  lib/
    pricing.js             Precios, claves del carrito y totales
    shipping.js            Rango y costo de envío (pendiente de tarifas)
    ritual.js              Convierte la receta en el guion del caldero
    order.js               Entrega, formas de pago, registro y mensaje de WhatsApp
    router.js              Enrutador mínimo por hash
  state/ShopContext.jsx    Estado: intention, focus, size, extras, dedication, quantity,
                           currentChapter, animationState, cart, lastOrder
  components/
    Grimorio.jsx           Libro abierto, siete capítulos y navegación
    PotionSelector · FocusSelector · SizeSelector · ExtrasSelector · DedicationSelector
    RitualAnimation.jsx    Capítulo VI (caldero)
    Revelation.jsx         Capítulo VII
    Cauldron.jsx           Caldero en capas SVG
    Cart · Checkout · OrderComplete · OrderSummary
    home/                  Portada y secciones del inicio
    illustrations/         Botellas, sigilos, sellos, velas, cristales (todo SVG)
  styles/                  base, layout, grimorio, ritual, shop, sections, animations, fonts
```

## Accesibilidad y rendimiento

- Opciones con controles nativos (radios) o botones con `aria-pressed`; todo se usa con teclado.
- Al pasar de capítulo, el foco va al título nuevo; el precio y el ritual se anuncian con `aria-live`.
- `prefers-reduced-motion`: el caldero y la revelación muestran el resultado sin animar; siempre existe **Saltar animación**.
- Los videos de TikTok solo se cargan cuando la persona pulsa "Ver video".
- Sin imágenes pesadas: las ilustraciones son SVG y las tipografías (Cinzel, Cinzel Decorative, EB Garamond, licencia SIL OFL) van incluidas en `src/assets/fonts`.

## Tecnologías

React 19, Vite, CSS sin frameworks y [Motion for React](https://motion.dev).
