# Gancho, parte 1: animación hecha solo con código

Primeros 76.5 segundos de **«What's the most expensive mistake ever made?»**, construidos en
[Remotion](https://www.remotion.dev/) (React + TypeScript) a partir del storyboard
`Storyboard_Gancho_Animacion_Codigo.pdf`.

Todo está dibujado con código: formas SVG y CSS dentro de componentes de React. No hay fotos,
videos, íconos ni ilustraciones externas. Las fuentes se cargan con `@remotion/google-fonts`.

| | |
|---|---|
| Composición | `Gancho`: 1920 × 1080, 30 fps, **2,295 frames** (76.5 s) |
| Planos | 18, un `<Sequence>` por plano |
| Salida | MP4 (H.264, yuv420p) |

## Entregables

```
entregables/gancho.mp4            ← render completo con subtítulos
entregables/planos/plano-01.png   ← frame central de cada plano (01 a 18)
```

---

## 1. Cómo correrlo

Necesitas Node.js 22.18 o más nuevo (el script de PNG importa `src/timing.ts` directamente) y conexión a internet (para las fuentes
de Google y, la primera vez, para que Remotion descargue su Chrome headless).

```bash
cd animacion_gancho
npm install
```

| Para… | Comando | Resultado |
|---|---|---|
| Ver y revisar en el navegador | `npm run studio` | Abre Remotion Studio con línea de tiempo |
| Renderizar el video completo | `npm run render` | `out/gancho.mp4` |
| PNG del frame central de cada plano | `npm run stills` | `out/planos/plano-01.png` … `plano-18.png` |
| PNG solo de algunos planos | `npm run stills -- 5 12` | `plano-05.png`, `plano-12.png` |
| PNG de un frame cualquiera | `npm run stills -- f=1480` | `out/planos/frame-1480.png` |
| Revisar tipos | `npm run typecheck` | |

### Subtítulos

La narración aparece como subtítulos y los diálogos como globos. Los subtítulos se activan o
desactivan con la prop `showSubtitles` de la composición:

```bash
npx remotion render Gancho out/gancho-sin-subtitulos.mp4 --props='{"showSubtitles":false}'
```

En Remotion Studio también se puede cambiar desde el panel de props.

### Usar un Chrome que ya tengas

Si no quieres que Remotion descargue su Chrome, indica la ruta de uno headless:

```bash
REMOTION_CHROME=/ruta/a/chrome-headless-shell npm run render
```

---

## 2. Ajustar los tiempos cuando exista la voz

**Todo el ritmo vive en un solo archivo: [`src/timing.ts`](src/timing.ts).** Cada plano tiene:

```ts
p05: {
  titulo: 'Balanza: £100 contra dos vuelos',
  duracion: 12.0,                                  // segundos
  claves: {rotulo: 0.3, balanza: 0.6, billete: 6.8, nota: 7.3, boleto1: 9.2, boleto2: 9.5},
  subtitulos: [
    {t: 0, texto: 'A finales de 1992, Hoover lanzó una promoción en el Reino Unido'},
    {t: 5.6, texto: 'en la que, si gastabas cien libras en sus productos,'},
    {t: 8.7, texto: 'te regalaba dos vuelos de ida y vuelta a Estados Unidos.'},
  ],
},
```

- `duracion`: largo del plano en segundos. El **frame de inicio** de cada plano se calcula
  sumando las duraciones anteriores: si alargas un plano, los siguientes se recorren solos y la
  duración total de la composición se actualiza.
- `claves`: momentos dentro del plano en segundos desde su inicio (el «+6.8 s» del storyboard).
  Las animaciones leen estos momentos; lo demás (caídas, rebotes, resortes) se calcula a partir
  de ellos.
- `subtitulos`: cada frase y el segundo en que entra; se queda hasta la siguiente frase o el final
  del plano (o hasta `fin`, si se indica).
- `sfx`: efectos de sonido anotados (no se genera audio).
- `PALABRAS_POR_SEGUNDO` (2.8): velocidad del texto palabra por palabra del plano 10.

El mismo archivo exporta lo calculado en frames: `PLANOS`, `LISTA_PLANOS`, `DURACION_TOTAL`,
`SUBTITULOS`, `SFX` y `FRAMES_CENTRALES`.

### Efectos de sonido anotados

| Plano | Momento | SFX |
|---|---|---|
| 1 | +1.8 s | «plink» al rebotar el teléfono |
| 3 | +0.00, 0.27, 0.54, 0.81, 1.08, 1.35 s | «whoosh» por barra |
| 4 | +1.5 s | rechinido al frenar |
| 6 | +0.6 s · +2.5 s | golpe metálico · «boing» del brinco |
| 12 | +0.0 s | golpe |
| 14 | +0.1 s | «clac» de la calculadora |
| 18 | +0.2 s | «clic» del botón |

---

## 3. Cómo está organizado

```
src/
  timing.ts            ← tiempos de todo (el único archivo para ajustar el ritmo)
  estilo.ts            ← paleta, tonos derivados, fuentes y grosores de contorno
  Gancho.tsx           ← composición: un <Sequence> por plano + subtítulos + textura
  Root.tsx, index.ts   ← registro de la composición
  util/anim.ts         ← spring/interpolate con easing, respiración, parpadeo, temblor con
                         semilla, oscilación amortiguada y cinemática inversa para los brazos
  componentes/
    Camara.tsx         ← Camera: translate + scale, temblor y estela (desenfoque simulado)
    Linea.tsx          ← mantiene los contornos en 6 px / 3 px en pantalla aunque haya zoom
    Textura.tsx        ← fondo papel, grano animado (feTurbulence) y viñeta
    Subtitulos.tsx, Rotulo.tsx, Globo.tsx (globo normal y globo dentado)
    personajes/        ← Aspiradora, Ejecutivo, Especialista, Mano y partes compartidas
                         (ojo, boca, ceja, guante, brazo articulado, gota de sudor)
    objetos/           ← Gráfica de barras e íconos, Balanza, billete, boletos, etiqueta,
                         periódico, oficina (escritorio, letrero, botón), pergamino,
                         teléfono, coladera y cartera
  planos/              ← Plano01 … Plano18 (agrupados por escenario)
scripts/render-stills.mjs ← PNG del frame central de cada plano
```

### Personajes por partes y expresiones por props

Cada personaje se dibuja por partes separadas (cabeza, ojos, cejas, boca, brazos) y recibe su
expresión por props en lugar de tener un dibujo distinto por plano:

- **Aspiradora**: `expresion` = `neutral` · `seria` · `sorprendida`, más `mira`, `parpadeo`,
  `asiente`, `inclinacion`, `giroRuedas` y `aplasta`.
- **Ejecutivo**: `expresion` = `seguro` · `confundido` · `satisfecho`, más `cabeza`, `cuerpo`,
  `respiracion`, `habla` y la pose de cada brazo.
- **Especialista**: presets `calmado` · `alterado` · `desesperado` · `serio` · `sonriente` ·
  `indignado` · `ojosEnBlanco`. Cada preset es un conjunto de números (altura y ángulo de cejas,
  tamaño de ojos, párpado, pupilas, boca, sudor, brillo), así que dos expresiones se mezclan
  sin saltos: `expresionEspecialista('calmado', 'alterado', t)`.
- **Mano** (plano 1): `abre` de 0 (sujetando) a 1 (dedos abiertos y tiesos).

Los brazos tienen hombro y codo; se les da el punto al que debe llegar la mano y el codo se
calcula con cinemática inversa.

### Movimiento

- `spring()` e `interpolate()` de Remotion con easing suave; lineal solo en el contador de la
  barra y en el rollo que rueda.
- Temblores, parpadeos y variaciones con `random()` de Remotion y semilla fija: el render sale
  igual siempre.
- Los personajes respiran (escala vertical de 1 a 1.01 cada 2 s) y parpadean cada 3 a 4 s.

---

## 4. Qué se simplificó y por qué

Ningún cambio altera lo que cuenta cada plano.

**Generales**

- **Colores derivados.** La paleta no trae piel, madera, traje negro, piso, pared ni la bolsa de
  la aspiradora. Se usaron tonos mezclados de la paleta (en `estilo.ts`, objeto `D`) para que el
  conjunto siga viéndose coherente. La pared es «mostaza clara» como pide el storyboard.
- **Planos medios con la cámara.** La oficina es un solo dibujo; los planos medios del
  especialista y del ejecutivo son acercamientos (zoom 1.9) de la cámara sobre ese dibujo. Así la
  posición de los personajes es siempre la misma. Los contornos se compensan con el zoom para
  seguir midiendo 6 px y 3 px en pantalla.
- **Sin voz, la boca «aletea»** mientras aparece cada globo, para que se note quién habla.
- **Globos con tamaño final desde el inicio.** En el texto palabra por palabra, las palabras que
  faltan ocupan su lugar invisibles; así el globo no cambia de tamaño mientras se llena.
- **Desenfoque de movimiento** = cuatro copias del cuadro al 22 % de opacidad durante el paneo.

**Por plano**

- **1.** El teléfono se pone de canto (se angosta) antes de colarse para que quepa entre las
  rendijas. El `clipPath` es un corte horizontal a la altura de la rejilla, no la forma de cada
  rendija. La manga de la mano es verde azulado (el storyboard no da color).
- **3.** Los íconos (sonda, servidor, disco duro, pizza, teléfono, bomba de gasolina) son trazos
  SVG dibujados a mano, de un solo color. Como las barras se salen de cuadro, cada ícono aparece
  en la parte visible de su barra, no en una altura fija de la barra.
- **4.** Además de bajar, la cámara se acerca (zoom 1.35) a la barra de $72M para que la barra y
  la aspiradora queden juntas. La aspiradora pasa por delante de las otras barras.
- **5–6.** La aspiradora ya está en escena desde el plano 5, a un lado, mirando lo que cae: el
  plano 6 la necesita ahí para brincar al plato. La etiqueta «£600» cuelga de la viga, cerca del
  plato de los boletos, para poder balancearse como péndulo. Los boletos quedan un poco
  escondidos dentro del plato.
- **7.** Anuncio de diseño propio, en inglés, sin nombre de periódico ni logotipo (la cabecera
  dice «ADVERTISEMENT · NOVEMBER 1992»), para no imitar ni el anuncio ni un periódico reales.
- **8.** Como la aspiradora es plana y de frente, «asentir» es una inclinación con un leve
  aplastamiento de la parte de arriba y las pupilas hacia abajo.
- **10.** Con 2.8 palabras por segundo, las 22 palabras tardan 7.9 s: «seiscientas» aparece en
  +7.7 s y le quedan 0.3 s antes del corte. Con la voz real se ajusta `duracion` y
  `PALABRAS_POR_SEGUNDO` en `timing.ts`.
- **11.** El paneo es casi horizontal: también sube un poco porque la cabeza del ejecutivo está
  más arriba que la del especialista.
- **12.** El globo dentado tapa parte del sombrero del ejecutivo; la cara se mantiene visible.
- **13.** El papel cae recto delante del escritorio y en el piso el rollo rueda «hacia la cámara»
  (hacia abajo en pantalla), sin perspectiva. La cámara lo sigue y frena al final para que el
  rollo salga de cuadro. Las reglas se reparten a lo largo del papel para que se lean mientras la
  cámara baja. Cuando la boca del ejecutivo sale de cuadro, la cola del globo apunta hacia arriba
  (habla fuera de cuadro).
- **14 y 16.** Con los brazos cruzados, la calculadora queda sujeta contra el pecho. En el 16 el
  brazo izquierdo sigue cruzado mientras la mano derecha saca la cartera.
- **17.** El storyboard no dice cómo aparece el botón: sale con un saltito justo después de que
  cae el letrero. El letrero es un cartel luminoso colgado de dos hilos.
- **18.** Corte a negro sin fundido en los últimos 10 frames; el subtítulo termina ahí.

---

## 5. Revisión

Preguntas del storyboard para evaluar el render:

- ¿Se entiende cada plano sin la voz, solo con los subtítulos y la imagen?
- ¿Los personajes se sienten vivos (parpadeos, respiración, expresiones) o se ven rígidos?
- ¿Los cambios de expresión del especialista se notan en tres etapas claras?
- ¿Los remates tienen su pausa (plano 8, plano 18) o se pasan de largo?
- ¿La gráfica, la balanza y el rollo se leen con claridad y a buen ritmo?
- ¿El estilo es coherente en todos los planos (paleta, contornos, tipografía)?
- ¿Qué tan fácil es ajustar los tiempos cuando exista la voz (un solo archivo de tiempos)?

Hoover es una empresa real: aparece su nombre, pero no su logotipo ni sus anuncios reales.
