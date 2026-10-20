# DESIGN.md · Dirección «Luz de vela»

Estado: **dirección aprobada.** Se extiende por etapas:

- **3A:** Hero de la portada y Capítulo I del Grimorio, dentro de `.vela` (`src/styles/vela.css`).
- **3B:** encabezado global, menú, marcapáginas I–VII, barras inferiores del Grimorio (y sus
  botones), entorno exterior del libro en los 7 capítulos y transición del Hero al resto de la portada.
- **Pendiente:** interior de los capítulos II–VII, caldero, revelación, checkout, confirmación,
  secciones de la portada y pie, que conservan el sistema anterior hasta su etapa.

Los colores `--vela-*` se declaran en `:root` (`vela.css`).

Contexto de producto: `PRODUCT.md`.

---

## 1. Dirección

**Luz de vela.** Todo el sitio es un cuarto a oscuras. Lo único iluminado es lo que importa: el
Grimorio, el caldero, la Scoop y la acción principal. La vela y el fuego son el hilo visual.

- **Idea:** la vela que ilumina la mesa de la Bruja Sabia es la única fuente de luz de la página.
- **Sensación:** oscura, cinematográfica, mágica, elegante, premium, misteriosa y adulta.
- **Influencia secundaria, «Códice alquímico»,** limitada al Grimorio: detalles de manuscrito,
  numeración romana, anotaciones alquímicas pequeñas, trazos de tinta y algún elemento de grabado.
  El resto del sitio **no** es un manuscrito.
- **Lo que se puede hacer:** en la portada la luz sigue suavemente al puntero. En el Capítulo I,
  la intención elegida tiñe la luz de la página con el color de su poción.

## 2. Paleta

Los tokens se definen dentro de `.vela` y se usan siempre por rol, nunca con hex sueltos.

| Token | Hex | Rol |
|---|---|---|
| `--vela-hollin` | `#0E0B0A` | Fondo principal: negro cálido, nunca azulado |
| `--vela-humo` | `#1B1513` | Superficies: barras, paneles |
| `--vela-humo-2` | `#271E1B` | Superficie elevada o cuero oscuro del libro |
| `--vela-cera` | `#EFE3CC` | Texto principal sobre oscuro |
| `--vela-cera-tenue` | `#BBAD97` | Texto secundario sobre oscuro (contraste 8.9:1) |
| `--vela-llama` | `#E3A048` | **Solo luz**: halos, llama, brillo del foco de luz. Nunca texto largo ni fondo de botón |
| `--vela-lacre` | `#9E2350` | Acción principal (frambuesa lacre) |
| `--vela-lacre-vivo` | `#B42C5E` | Hover y estado activo de la acción |
| `--vela-oro` | `#C9A24A` | Detalle: filetes, numerales, bordes finos. Nunca relleno grande |
| `--vela-amatista` | `#5E3D6E` | Pigmento secundario: cristales, tintas. Nunca fondo dominante |
| `--vela-vitela` | `#EADBBB` | Pergamino iluminado |
| `--vela-vitela-sombra` | `#BFA67A` | Pergamino lejos de la luz (bordes y canal) |
| `--vela-tinta` | `#2B1B12` | Texto sobre pergamino (contraste 12:1) |
| `--vela-tinta-suave` | `#5B4330` | Texto secundario sobre pergamino (contraste 6.7:1) |
| `--vela-rubrica` | `#8A1E45` | Rúbricas del manuscrito: numerales, anotaciones, estado elegido |

**Proporción:** 80 % hollín y humo, 12 % cera y vitela iluminadas, 5 % llama como luz, 2 % lacre
(la acción) y 1 % oro. Un solo elemento lacre sólido por pantalla.

## 3. Tipografías

Todas van alojadas en el proyecto como WOFF2 (subconjunto latino, licencia SIL OFL). Nunca se
cargan desde Google Fonts en tiempo de ejecución.

| Familia | Rol | Pesos |
|---|---|---|
| **Cormorant Garamond** | Títulos principales, nombre de la marca, títulos de capítulo y nombres de opciones | 300 (display), 500 (títulos) |
| **EB Garamond** | Texto, lectura, botones y anotaciones (en cursiva) | 400, 500, cursiva 400 |
| **Cinzel** | Solo logo, sellos, numerales romanos y el lema ceremonial | 600 |

- Texto en **mayúsculas y minúsculas normales**. Las únicas mayúsculas son Cinzel en numerales y en
  el lema, siempre pequeñas.
- En oscuro, los títulos usan pesos ligeros: brillan solos. Nada de negritas pesadas sobre negro.

## 4. Escala tipográfica

Razón aproximada de cuarta justa (1.333) y base de 18 px para leer.

| Paso | Uso | Tamaño | Interlínea | Tracking |
|---|---|---|---|---|
| Display | Nombre en el Hero | `clamp(2.5rem, 5.4vw, 4.75rem)`, Cormorant 300 | 1.02 | -0.01em |
| Título | Título de capítulo | `clamp(2.1rem, 3.6vw, 3.1rem)`, Cormorant 500 | 1.08 | -0.005em |
| Subtítulo | Nombre de una opción | `1.6rem`, Cormorant 500 | 1.15 | 0 |
| Entrada | Frase del Hero, intro de capítulo | `clamp(1.15rem, 1.6vw, 1.3rem)`, EB Garamond | 1.55 | 0 |
| Texto | Párrafos. Las descripciones de opciones usan `1.05rem` | `1.125rem` (18 px), EB Garamond | 1.55 | 0 |
| Nota | Anotaciones, temas, pistas | `1rem` cursiva, EB Garamond | 1.45 | 0 |
| Ceremonial | Lema, numerales | `0.8–0.95rem`, Cinzel 600 | 1.2 | 0.2–0.3em |

El texto nunca baja de 16 px, salvo lo ceremonial en Cinzel, que es decorativo o redundante.

## 5. Espaciado

Base de 4 px. Escala: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.

- Márgenes laterales de página: 16 px en celular y 32 px en escritorio.
- Dentro de un bloque: 8 a 24 px. Entre bloques: 48 a 96 px.
- Los objetos iluminados necesitan aire: la oscuridad alrededor es parte del diseño.

## 6. Botones

- **Primario:** relleno sólido lacre, texto cera, esquinas de 2 px, sin degradado, sin sombra en
  reposo y sin mayúsculas. EB Garamond 500 a 1.1rem con un tracking leve de 0.02em. Altura mínima
  de 48 px, o 56 px en el Hero.
  - Hover: `--vela-lacre-vivo` y un halo de llama muy tenue alrededor; la luz se acerca.
  - Pulsado: escala 0.98.
- **Secundario:** texto cera con borde de 1 px en cera al 35 %, transparente. Hover: borde cera al
  70 %.
- **Enlace:** cursiva en cera tenue, subrayada y con desplazamiento de 4 px.
- **Esperando** (`aria-disabled`): fondo lacre apagado `#4a2633` con texto cera tenue (5.9:1) y
  borde punteado. Sin bajar la opacidad. Sigue siendo pulsable para explicar lo que falta.
- **Foco:** contorno de 2 px con 3 px de separación, siempre visible. En `--vela-llama` sobre
  oscuro y en `--vela-rubrica` sobre pergamino.

## 7. Superficies

- **Fondo:** hollín liso. La profundidad la da la **luz**, no las capas.
- **Barras fijas** (navegación del libro y barra de receta): humo opaco con un filete superior en
  oro al 30 %. Sin desenfoque de fondo.
- **Cuero del Grimorio:** humo cálido casi negro con un filete de oro. El morado sobrevive solo
  como pigmento en el logo, los cristales y las pociones.
- **Pergamino:** vitela iluminada desde arriba a la izquierda y más sombría hacia el canal y los
  bordes, sin cajas dentro de la página.
- **Sombras:** solo en lo que realmente flota (la barra fija o el libro sobre la mesa) o como
  oscuridad natural, nunca como "tarjeta elevada".

## 8. Reglas de iluminación

1. **Una fuente de luz por escena:** la vela. La dirección de la luz es coherente: arriba a la
   izquierda en el libro y desde las velas en la mesa.
2. **Lo importante es lo más luminoso de su pantalla:** el libro, la opción elegida y la acción.
3. La luz se dibuja con **caídas radiales cálidas** (`--vela-llama` a baja opacidad sobre hollín o
   vitela). Es luz, no decoración: nunca son degradados lineales de color ni morados.
4. **La oscuridad enmarca, no oculta:** el texto siempre cumple contraste AA aunque esté lejos de la
   luz.
5. El color de una poción solo tiñe la luz cuando esa poción está elegida.
6. La luz respira (opacidad 0.92 → 1 en ciclos de 5 s o más), nunca parpadea de forma brusca.

## 9. Tratamiento del Grimorio

- **El libro** es un objeto en penumbra sobre la mesa. El cuero es oscuro y las páginas reciben la
  luz de la vela.
- **Marcapáginas:** numerales romanos en Cinzel. El capítulo actual está **iluminado** con un halo
  de llama detrás del numeral; los demás quedan en penumbra. Los títulos de capítulo van en EB
  Garamond.
- **Encabezado de capítulo:**
  - una inicial romana grande en rúbrica (Cinzel) a la izquierda;
  - el nombre del capítulo en cursiva;
  - el título en Cormorant;
  - debajo, un **trazo de tinta** que se dibuja al abrir la página.
- **Anotaciones alquímicas:** glifos pequeños (luna, sol, sal, azufre) en tinta suave cerca del
  trazo. Son decorativos (`aria-hidden`) y no llevan texto inventado.
- **Receta:** un asiento de manuscrito con guiones de puntos y cursiva de tinta, sin caja con borde.
- **Opciones:** objetos sobre la página, no tarjetas.
  - La botella, su nombre, la descripción y los temas en cursiva.
  - La opción elegida se ilumina con la luz de su color, gana el sello de lacre (siempre lacre, no
    el color de la poción) y su nombre se subraya con tinta. Las demás botellas se apagan un poco y
    la luz de todo el capítulo se tiñe con el color elegido.
  - Sin botón "Elegir": toda la opción es el control (`<label>` + radio).

### Navegación global (Etapa 3B)

- **Encabezado:** hollín opaco, sin desenfoque, con un filete inferior de oro al 16 %.
  - Enlaces en EB Garamond, cera tenue, y cera al pasar el cursor.
  - La página actual lleva una chispa de llama bajo el enlace (una forma, no solo un color).
  - "Abrir Grimorio" va con un filo lacre; en su página, con un tinte lacre.
  - El contador del pedido lleva un aro de oro.
  - En escritorio "Inicio" se oculta, porque el logo lleva al inicio con el nombre accesible
    "Scoops de la Bruja Sabia: ir al inicio". En el menú del celular sí aparece.
- **Marcapáginas I–VII:**
  - Actual: halo y llama.
  - Completado: aro y marca de verificación en oro, el único estado con oro.
  - Disponible: aro de cera sólido.
  - Bloqueado: aro punteado y apagado.
- **Barras inferiores:** humo opaco con un filete de oro. "Siguiente" en lacre, "Anterior" en
  contorno cera y el estado de espera accesible.
- **Foco en el encabezado, el marcapáginas y las barras:** 2 px en llama con 3 px de separación;
  en el marcapáginas, redondo sobre el círculo.
- **Entorno del Grimorio:** hollín con la luz de la vela sobre el libro, que se funde hacia el pie.
- **Transición del Hero a la portada:** `.vela-portada` es un velo de hollín que se desvanece en
  unos 80 vh, así las secciones nacen de la oscuridad.

## 10. Tratamiento del caldero (pendiente de extender)

Todavía no está implementado en el prototipo. Cuando se extienda:

- El caldero queda iluminado **desde abajo** por el fuego, con el humo en capas lentas.
- Cada ingrediente cambia el color de la luz que se refleja en el cuarto.
- En la revelación, la luz se abre como al destapar una vela.
- Se conserva la secuencia actual: tiempos, saltar animación y el foco en "Revelar".

## 11. Animaciones y microinteracciones

- **Un momento principal por pantalla.**
  - En el Hero, **la vela se enciende**: la escena pasa de penumbra a iluminada en unos 1.6 s.
  - En el Capítulo I, **el trazo de tinta se escribe** en unos 0.9 s.
- **Llama:** el parpadeo actual de las velas, sutil.
- **Luz que sigue al puntero** en el Hero: solo con puntero fino, interpolada (sin saltos) y nunca
  con movimiento reducido.
- **Elegir una opción:** el halo de su color florece en unos 400 ms, el sello se estampa y se
  conservan el sonido y las partículas actuales.
- **Hover:** la opción se acerca a la luz (sube 2 px y aumenta el brillo de la botella).
- Solo se animan `transform`, `opacity` y propiedades que no cambian el layout.
- **Movimiento reducido:** todo queda en su estado final, iluminado y sin seguimiento del puntero.
  La regla global de `animations.css` ya fija las animaciones en su último fotograma.

## 12. Responsive

- **Celular (desde 320 px):**
  - **Hero:** las velas flanquean el libro de cerca, el libro ocupa alrededor del 52 % del ancho,
    el nombre va en dos líneas como máximo y el botón ocupa todo el ancho.
  - **Capítulo I:** una página tras otra. Las opciones van en filas con la botella a la izquierda y
    el texto a la derecha. La barra de receta inferior es de humo, con el botón lacre.
- **Tableta:** el mismo libro de una columna con dos opciones por fila desde 560 px.
- **Escritorio (≥ 900 px):** el libro abierto a doble página y la navegación fija abajo cuando el
  libro no cabe.
- Sin desplazamiento horizontal en ningún ancho.

## 13. Accesibilidad

- Contraste AA como mínimo: cera sobre hollín 15.4:1, cera tenue sobre hollín 8.9:1, tinta sobre
  vitela 12.1:1, tinta suave sobre vitela 6.7:1, rúbrica sobre vitela 6.5:1, cera sobre lacre
  5.9:1 y cera sobre lacre vivo 4.8:1. El texto nunca se apoya en la vitela en sombra
  (`--vela-vitela-sombra`), que queda solo en bordes y canal.
- Foco visible siempre, de 2 px con separación: en llama sobre oscuro (8.8:1) y en rúbrica
  sobre pergamino (6.5:1). La llama sobre vitela no alcanza 3:1 y no se usa para el foco.
- Las opciones siguen siendo un grupo de radio nativo con `fieldset` y `legend`.
  En celular, el foco de teclado rodea solo la botella, no toda la fila, para que la opción no
  parezca una tarjeta.
- La luz, los glifos y los trazos son decorativos (`aria-hidden`).
- Objetivos táctiles de al menos 44 × 44 px.
- Se respeta `prefers-reduced-motion`.
- El orden de foco no cambia respecto al flujo actual.

## 14. Patrones prohibidos

- Degradados morados o azul-morado, botones con degradado y texto con degradado.
- Morado como fondo dominante.
- Glassmorphism o `backdrop-filter` decorativo.
- Estética SaaS: rejillas de tarjetas idénticas con icono arriba, insignias tipo píldora, banners
  de "Nuevo".
- Tarjetas repetitivas sin función, o tarjetas dentro de tarjetas.
- Texto general en mayúsculas o etiquetas pequeñas en mayúscula espaciada fuera de Cinzel
  ceremonial.
- Sombras grises de "tarjeta" en reposo, o resplandores de neón.
- Emojis como iconos.
- Más de una acción lacre sólida por pantalla.
- Llama o oro usados como fondo de bloques grandes.
- Convertir el sitio completo en un manuscrito antiguo: el Códice se queda en el Grimorio.
- Texto inventado sobre el negocio (precios, reseñas, garantías).
