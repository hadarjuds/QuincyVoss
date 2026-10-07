# QuincyFotos

Script de Photoshop que prepara las imágenes del canal para que **todas se vean igual**: mismo color (duotono), mismo contorno, misma sombra y misma textura de papel.

Sueltas las imágenes en tres carpetas, ejecutas el script una vez y te deja los resultados listos para animar.

| Carpeta | Para qué | Resultado |
|---|---|---|
| `1_recorte` | Objetos o personas a los que hay que quitar el fondo | PNG transparente con contorno negro y sombra (y un PSD con capas) |
| `2_impresion` | Fotos o documentos rectangulares | PNG con borde de papel y sombra (y un PSD con capas) |
| `3_completa` | Fondos e imágenes a pantalla completa | JPG de alta calidad, sin contorno ni sombra |

---

## Contenido

- [1. Qué hay en este proyecto](#1-qué-hay-en-este-proyecto)
- [2. Instalación](#2-instalación)
- [3. Primera vez: la carpeta base](#3-primera-vez-la-carpeta-base)
- [4. Uso diario](#4-uso-diario)
- [5. Qué hace cada tratamiento](#5-qué-hace-cada-tratamiento)
- [6. El registro (registro.txt)](#6-el-registro-registrotxt)
- [7. Cambiar la configuración](#7-cambiar-la-configuración)
- [8. Seleccionar sujeto en la nube](#8-seleccionar-sujeto-en-la-nube)
- [9. Primera prueba: lista de verificación](#9-primera-prueba-lista-de-verificación)
- [10. Problemas frecuentes](#10-problemas-frecuentes)
- [11. Para desarrolladores](#11-para-desarrolladores)

---

## 1. Qué hay en este proyecto

```
QuincyFotos.jsx        ← el script (lo único que ejecutas)
_texturas/papel.png    ← textura de papel (creada por ordenador, sin derechos de terceros)
README.md              ← este documento
desarrollo/            ← herramientas para verificar el script; no las necesitas
```

---

## 2. Instalación

### 2.1 Descargar

1. En la página del proyecto en GitHub, pulsa el botón verde **Code** y luego **Download ZIP**.
2. Busca el ZIP en tu carpeta **Descargas**, haz clic derecho sobre él y elige **Extraer todo…**.
3. Mueve la carpeta extraída a un lugar fijo, por ejemplo **Documentos\QuincyFotos**.
   Comprueba que dentro estén `QuincyFotos.jsx` y la carpeta `_texturas` con `papel.png`.

> Si Windows no muestra las extensiones (`.jsx`, `.png`), en el Explorador de archivos ve a **Vista > Mostrar > Extensiones de nombre de archivo**.

### 2.2 Ejecutarlo (elige una forma)

**Forma A: con Examinar (recomendada, no hay que instalar nada)**

1. Abre Photoshop.
2. Ve a **Archivo > Secuencias de comandos > Examinar…**
3. Busca `Documentos\QuincyFotos\QuincyFotos.jsx` y pulsa **Cargar** (o **Abrir**).

Photoshop recuerda la última carpeta, así que la próxima vez es aún más rápido.

**Forma B: arrastrándolo**

Con Photoshop abierto, arrastra `QuincyFotos.jsx` desde el Explorador de archivos y suéltalo sobre la ventana de Photoshop.

**Forma C: que aparezca en el menú Archivo > Secuencias de comandos**

1. Cierra Photoshop.
2. Copia `QuincyFotos.jsx` en la carpeta de scripts de Photoshop:
   `C:\Program Files\Adobe\Adobe Photoshop 20XX\Presets\Scripts`
   (`20XX` es tu versión. En el Explorador en español, `Program Files` aparece como **Archivos de programa**. En algunas instalaciones en español, `Presets\Scripts` puede llamarse **Ajustes preestablecidos\Secuencias de comandos**.)
   Windows te pedirá permiso de administrador: acéptalo.
3. Abre Photoshop. El script aparece en **Archivo > Secuencias de comandos > QuincyFotos**.

> Si usas la forma C, la textura no está junto al script. Copia tú `papel.png` en la carpeta `_texturas` de tu carpeta base (ver la sección 3). Además, para cambiar la configuración tendrás que editar la copia de `Program Files` como administrador. Por eso la forma A es más cómoda.

Si Photoshop muestra un aviso de seguridad al ejecutar un script, acéptalo: es normal la primera vez.

---

## 3. Primera vez: la carpeta base

1. Crea una carpeta llamada **`_Imagenes`** donde quieras (por ejemplo en el Escritorio o en Documentos).
2. Ejecuta el script (sección 2.2).
3. Se abre un diálogo: elige la carpeta `_Imagenes` y pulsa **Seleccionar carpeta**.
4. El script crea dentro todas las subcarpetas y recuerda la ruta. **No volverá a preguntar.**

```
_Imagenes/
  1_recorte/      ← imágenes a las que hay que quitar el fondo
  2_impresion/    ← fotos o documentos rectangulares
  3_completa/     ← imágenes a pantalla completa
  _listas/        ← resultados: recorte/, impresion/, completa/
  _procesadas/    ← originales ya procesados: 1_recorte/, 2_impresion/, 3_completa/
  _texturas/      ← papel.png
  registro.txt    ← qué se procesó, qué falló y qué hay que revisar
```

**La textura:** si ejecutaste el script desde la carpeta descargada (formas A o B), copia `papel.png` a `_Imagenes/_texturas/` automáticamente. Si no, cópiala tú. Sin textura, el script funciona igual pero lo avisa en el registro y en el resumen final.

Si eliges una carpeta que no se llama `_Imagenes`, el script pregunta si quieres crear `_Imagenes` dentro de ella (**Sí**) o usar la carpeta elegida tal cual (**No**).

**Para cambiar de carpeta base más adelante**, tienes tres opciones:

- Mantén pulsada la tecla **Mayús (Shift)** mientras pulsas **Cargar** o sueltas el script, y sigue pulsándola hasta que aparezca el diálogo para elegir carpeta.
- O escribe la ruta en `CARPETA_BASE` dentro de CONFIG (sección 7).
- O borra el archivo donde se guarda la ruta: escribe `%APPDATA%\QuincyFotos` en la barra de direcciones del Explorador y borra `carpeta_base.txt`.

---

## 4. Uso diario

1. Suelta las imágenes en `1_recorte`, `2_impresion` y/o `3_completa`.
   Formatos: **jpg, jpeg, png, webp, tif, tiff y psd**.
2. Ejecuta el script **una vez**: procesa las tres carpetas.
3. Mientras trabaja, una ventanita muestra el progreso. No uses Photoshop mientras tanto.
4. Al terminar, aparece un resumen: cuántas imágenes se procesaron por tratamiento, cuántas fallaron y cuántas hay que revisar.
5. Recoge los resultados en `_listas/recorte`, `_listas/impresion` y `_listas/completa`.

Reglas que el script respeta siempre:

- **Nunca modifica un original.** Lo abre, trabaja sobre una copia en memoria y lo cierra sin guardar.
- Si la imagen salió bien, **mueve el original** a `_procesadas/<carpeta>`. Para moverlo, primero lo copia, comprueba que la copia tenga el mismo tamaño y solo entonces quita el original de la carpeta de entrada.
- Si la imagen **falló, el original se queda donde estaba**, así puedes corregir y volver a ejecutar.
- **Nunca sobrescribe**: si `foto.png` ya existe, guarda `foto_2.png`, después `foto_3.png`, etc. El PNG y el PSD de una misma imagen siempre llevan el mismo número.
- Si una imagen falla, la anota y sigue con la siguiente.
- Al terminar, deja como estaban tus **unidades de regla** y el **modo de diálogos** de Photoshop.

---

## 5. Qué hace cada tratamiento

Todas las imágenes se convierten primero a **RGB, 8 bits y perfil sRGB**. El perfil importa: un mismo color hexadecimal se ve distinto en Adobe RGB o en Display P3 (fotos de iPhone). Convertir todo a sRGB es lo que garantiza que el duotono salga idéntico en todas.

### RECORTE (`1_recorte`)

1. Aplana la imagen y la lleva a un tamaño de trabajo.
2. **Seleccionar sujeto** (antes de tocar el color, porque así detecta mejor).
3. **Revisión automática**: si no encuentra sujeto, o si la selección ocupa más del 97 % del lienzo, la imagen se guarda igual pero queda marcada **REVISAR**.
4. Recorta a la silueta y escala para que **el sujeto mida exactamente `ALTO_RECORTE`** (1600 px) de alto. Así el contorno de 10 px se ve igual en todos los recortes, aunque en la foto original el sujeto ocupara poco espacio.
5. Aplica el duotono, el semitono y la textura de papel, solo dentro de la silueta.
6. Agrega lienzo transparente alrededor, para que el contorno y la sombra no se corten.
7. Aplica **Trazo por fuera** (contorno) y **Sombra paralela** al grupo completo, para que sigan exactamente la silueta y queden por encima del color.
8. Guarda `PNG` (y `PSD` si `GUARDAR_PSD` es `true`).

Capas del PSD (puedes corregir a mano, sobre todo la máscara):

```
Recorte          (grupo, con Trazo y Sombra paralela)
  Papel          Multiplicar 35 %, recortada a la foto
  Semitono       Multiplicar 15 %, recortada a la foto
  Duotono        capa de ajuste Mapa de degradado, recortada a la foto
  Foto           con máscara de capa = la silueta
```

> El duotono es una capa de ajuste (se puede editar), pero no puede teñir el contorno: el contorno es un efecto **del grupo** y se dibuja después de todo lo que hay dentro.

### IMPRESIÓN (`2_impresion`)

1. Escala para que el lado largo mida `LADO_LARGO_IMPRESION` (1600 px).
2. Duotono, semitono y textura de papel en toda la imagen.
3. Borde de papel de `BORDE_PAPEL_PX` (40 px) en `COLOR_PAPEL`, con la misma textura pero más suave (`TEXTURA_BORDE_OPACIDAD`).
4. Lienzo transparente alrededor y Sombra paralela. Sin rotación: la rotas tú al animar.
5. Guarda `PNG` (y `PSD` si `GUARDAR_PSD` es `true`).

```
Impresion        (grupo, con Sombra paralela)
  Papel / Semitono / Duotono   recortadas a la foto
  Foto
  Papel del borde              recortada al borde
  Borde de papel
```

### COMPLETA (`3_completa`)

1. Reduce para que el lado largo mida como máximo `LADO_LARGO_COMPLETA` (3840 px). **Nunca amplía** y nunca recorta: el encuadre lo decides tú al animar.
2. Duotono, semitono y textura de papel.
3. Sin contorno, sin borde y sin sombra.
4. Guarda `JPG` de alta calidad.

**Sobre la textura:** `papel.png` mide 2048 × 2048. En imágenes más grandes se repite en mosaico; no se estira. Así el grano tiene el mismo tamaño en todas. La textura no tiene costuras, por lo que las uniones no se notan.

**No se agrega grano**: lo aplicas tú en la edición a todo el video.

---

## 6. El registro (`registro.txt`)

Cada ejecución agrega un bloque al final de `_Imagenes/registro.txt` (ábrelo con el Bloc de notas):

```
======================================================================
QuincyFotos 1.0  |  2026-10-07 10:32:01  |  Photoshop 27.0.0  |  3 imágenes
Carpeta base: C:\Users\Ana\Desktop\_Imagenes
CONFIG: ALTO_RECORTE=1600  NORMALIZAR_SUJETO=true  ...
----------------------------------------------------------------------
2026-10-07 10:32:15  OK      recorte   taza.jpg  ->  _listas/recorte/taza.png + taza.psd
2026-10-07 10:32:31  REVISAR recorte   ana.jpg  ->  _listas/recorte/ana.png + ana.psd  |  la selección ocupa el 99 % del lienzo (...)
2026-10-07 10:32:40  ERROR   impresion factura.webp  ->  falló en el paso "abrir": ... (línea 1234). El original sigue en 2_impresion.
----------------------------------------------------------------------
Resumen: 2 procesadas, 1 para revisar, 1 fallidas.
```

- **OK**: todo bien.
- **REVISAR**: se guardó, pero conviene mirarla. Motivos posibles: Seleccionar sujeto falló o seleccionó casi todo, se omitió el semitono o la textura por un error, la imagen se amplió más de 2 veces, o no se pudo mover el original.
- **ERROR**: no se guardó nada de esa imagen y el original sigue en su carpeta. Indica en qué paso falló.
- **AVISO**: información (por ejemplo, que falta `papel.png`).

La línea `CONFIG:` guarda la configuración usada en cada ejecución. Si un día cambias los colores y quieres volver a los anteriores, búscalos ahí.

---

## 7. Cambiar la configuración

### Cómo editar

1. Haz clic derecho en `QuincyFotos.jsx` > **Abrir con** > **Bloc de notas**.
2. Arriba del todo está el bloque `CONFIG`. **Cambia solo los valores**, lo que está a la derecha de los dos puntos.
3. Guarda con **Ctrl + S** y vuelve a ejecutar el script.

Reglas para no romperlo:

- Los **colores** van entre comillas, en hexadecimal de 6 caracteres: `"1C1915"` (con `#` también vale).
- Los **números** van sin comillas: `1600`.
- **true** / **false** sin comillas.
- Cada línea termina en **coma**, menos la última antes de la `}` final.
- Si un valor no es válido, el script no procesa nada y te dice qué parámetro corregir. Si falta una coma o unas comillas, Photoshop muestra un error de sintaxis con el número de línea.

### Parámetros

| Parámetro | Valor inicial | Qué hace |
|---|---|---|
| `CARPETA_BASE` | `""` | Vacío = el script la pide y la recuerda. O escribe la ruta con barras normales: `"C:/Users/Ana/Desktop/_Imagenes"`. |
| `ALTO_RECORTE` | `1600` | Alto final de cada recorte, en píxeles. |
| `NORMALIZAR_SUJETO` | `true` | `true`: mide el alto del **sujeto** ya recortado (recomendado). `false`: mide la **foto entera** antes de recortar, y el recorte queda más bajo. |
| `LADO_LARGO_IMPRESION` | `1600` | Lado largo de las impresiones (sin contar el borde). |
| `LADO_LARGO_COMPLETA` | `3840` | Lado largo máximo de las completas. Nunca amplía. |
| `COLOR_TINTA` | `"1C1915"` | Color del contorno y de la sombra. |
| `DUOTONO` | `["1C1915", "8A6B4E", "F3E9D2"]` | Colores del mapa de degradado, de oscuro a claro. Puedes poner 2 o más. |
| `CONTORNO_PX` | `10` | Grosor del contorno de los recortes. `0` = sin contorno. |
| `SOMBRA` | `{ distancia: 8, angulo: 135, opacidad: 30, suavidad: 0 }` | Sombra paralela. `angulo: 135` = luz arriba a la izquierda, sombra abajo a la derecha. `suavidad` es el "Tamaño" de la sombra en Photoshop: `0` = sombra dura. `opacidad: 0` = sin sombra. |
| `BORDE_PAPEL_PX` | `40` | Borde de papel de las impresiones. `0` = sin borde. |
| `COLOR_PAPEL` | `"FBF7EE"` | Color del borde de papel. |
| `TEXTURA_PAPEL_OPACIDAD` | `35` | Fuerza de la textura (modo Multiplicar). `0` = sin textura. |
| `TEXTURA_BORDE_OPACIDAD` | `20` | Fuerza de la textura sobre el borde de papel. |
| `SEMITONO_ACTIVO` | `true` | Trama de puntos sutil. `false` = sin trama. |
| `SEMITONO_RADIO` | `6` | Tamaño de los puntos (de 4 a 127). |
| `SEMITONO_OPACIDAD` | `15` | Fuerza de la trama (modo Multiplicar). |
| `GUARDAR_PSD` | `true` | Además del PNG, guarda un PSD con capas (recorte e impresión). |
| `CALIDAD_JPG` | `11` | Calidad de los JPG de completa (0 a 12). |
| `LIMITE_SELECCION` | `97` | Si Seleccionar sujeto ocupa más de este %, se marca REVISAR. |
| `AVISO_AMPLIACION` | `2` | Si una imagen se amplía más de estas veces, se marca REVISAR (puede verse borrosa). |

### Ejemplos de cambios comunes

Contorno más grueso:
```
    CONTORNO_PX: 14,
```

Otra paleta (azules):
```
    DUOTONO: ["0F1B2D", "3E6A8A", "EAF2F5"],
```

Sepia de cuatro tonos:
```
    DUOTONO: ["1C1915", "5A4632", "B08D63", "F3E9D2"],
```

Sombra más lejana y un poco difuminada:
```
    SOMBRA: { distancia: 14, angulo: 135, opacidad: 35, suavidad: 4 },
```

Sin trama de puntos:
```
    SEMITONO_ACTIVO: false,
```

Textura más visible:
```
    TEXTURA_PAPEL_OPACIDAD: 60,
```

No guardar PSD (ocupa menos espacio):
```
    GUARDAR_PSD: false,
```

> **Coherencia del canal:** las imágenes ya procesadas no cambian solas. Si cambias colores o grosores a mitad de proyecto, las nuevas no combinarán con las anteriores. Para rehacer una imagen, mueve su original desde `_procesadas` a su carpeta de entrada y vuelve a ejecutar.

---

## 8. Seleccionar sujeto en la nube

Photoshop puede calcular "Seleccionar sujeto" en tu ordenador (más rápido) o en la nube de Adobe (bordes más finos, sobre todo en el pelo). El script usa el modo que tengas elegido en las preferencias.

1. Ve a **Edición > Preferencias > Procesamiento de imagen…** (en algunas versiones se llama **Procesamiento de imágenes**).
2. En la opción de **Seleccionar sujeto** (y Quitar fondo), elige **Nube (resultados detallados)** en lugar de **Dispositivo (resultados más rápidos)**.
3. Pulsa **OK**.

Si no encuentras la opción ahí: elige la herramienta **Selección de objetos** (tecla W). En la barra de opciones, junto al botón **Seleccionar sujeto**, hay una flechita con las mismas dos opciones.

Los nombres exactos pueden variar un poco según la versión. El modo nube necesita internet: si se corta la conexión, la imagen queda marcada como **REVISAR**.

---

## 9. Primera prueba: lista de verificación

El script se escribió sin poder ejecutar Photoshop (se verificó la sintaxis y se probaron en el ordenador las partes que no dependen de Photoshop). Por eso, **la primera vez prueba con solo tres imágenes** antes de procesar muchas.

### 9.1 Qué revisar primero (de más a menos riesgo)

1. **Seleccionar sujeto y la máscara** (recortes): que la persona u objeto quede recortado y el fondo transparente.
2. **Colores del duotono**: zonas oscuras ≈ `1C1915`, medias ≈ `8A6B4E`, claras ≈ `F3E9D2`.
3. **Contorno y sombra**: que sigan la silueta, que el contorno quede por encima del color y que la sombra caiga abajo a la derecha. Mira también si la sombra incluye el contorno (es lo esperado, pero depende de cómo dibuje Photoshop los efectos de grupo).
4. **Semitono**: puntos **grises**, no de colores, y solo dentro de la silueta.
5. **Textura**: visible solo dentro de la silueta o del papel; en la imagen completa, sin uniones visibles.
6. **Transparencia** del PNG y que no se corte nada en los bordes.
7. **Revisión automática**: que no marque REVISAR "selección del 100 %" en imágenes que salieron bien.

### 9.2 Las tres imágenes de prueba

Prepara:

- **A. Un objeto** con fondo simple (una taza, una moneda, un billete) → en `1_recorte`.
- **B. Una persona** de cuerpo entero o de medio cuerpo, con pelo visible → en `1_recorte`.
- **C. Un documento** (una factura, una página de periódico) → en `2_impresion`.
- (Opcional) **D. Un paisaje grande**, de más de 3840 px → en `3_completa`.

Ejecuta el script y revisa:

**General**
- [ ] El resumen final dice 3 procesadas (o 4) y 0 fallidas.
- [ ] `registro.txt` tiene una línea por imagen.
- [ ] Los originales se movieron a `_procesadas/1_recorte` y `_procesadas/2_impresion`.
- [ ] Tus unidades de regla siguen como estaban (**Edición > Preferencias > Unidades y reglas**).

**A. Objeto (`_listas/recorte/`)**
- [ ] El PNG tiene fondo transparente (en el Explorador o en Photoshop se ve el damero).
- [ ] El PNG mide 1676 px de alto: 1600 del objeto más 38 px de margen arriba y abajo (**Imagen > Tamaño de imagen**).
- [ ] El contorno es oscuro, de unos 10 px, rodea toda la silueta y no se corta en ningún borde.
- [ ] La sombra está abajo a la derecha, es dura y suave de opacidad.
- [ ] El color es el duotono marrón/crema (comprueba con el Cuentagotas, tecla I).
- [ ] Con zoom al 200 %: se ven los puntos del semitono (sutiles y grises) y el grano del papel, **solo dentro** del objeto.
- [ ] Abre el PSD: las capas son las de la sección 5, y el grupo "Recorte" tiene "fx".

**B. Persona (`_listas/recorte/`)**
- [ ] El recorte del pelo y de los bordes es aceptable. Si no, compara con el modo nube (sección 8).
- [ ] No quedan restos de fondo ni "islas" sueltas que agranden el recorte.
- [ ] Si la persona era pequeña en la foto, ahora mide 1600 px y la línea del registro quizá diga "ampliada": mira si se ve borrosa.
- [ ] En el PSD, la capa "Foto" tiene máscara. Pinta en ella con blanco o negro y comprueba que el contorno se actualiza.

**C. Documento (`_listas/impresion/`)**
- [ ] El lado largo de la foto mide 1600 px, con un borde de papel crema de 40 px alrededor.
- [ ] El borde tiene textura, más suave que la de la foto.
- [ ] Alrededor hay margen transparente y la sombra no se corta.
- [ ] El texto del documento sigue leyéndose con el semitono y la textura.

**D. Completa (`_listas/completa/`)**
- [ ] Es JPG, con el lado largo de 3840 px y el encuadre completo (sin recortes).
- [ ] Con zoom en el centro (x = 2048 px), no se ve la unión de la textura.

**Repetición**
- [ ] Mueve el original de A desde `_procesadas/1_recorte` de vuelta a `1_recorte` y ejecuta otra vez. Debe aparecer `nombre_2.png` sin tocar el primero.

### 9.3 Si algo falla: qué enviarme

1. **El bloque del registro** de esa ejecución: copia desde la línea `=====` hasta `Resumen:`. Incluye la versión de Photoshop, la configuración y, en cada ERROR, el **paso** y el **número de línea**.
2. **El texto de la alerta** si el script se detuvo (puedes copiarlo con **Ctrl + C** cuando la ventana está activa, o hacer una captura).
3. **Una captura del panel Capas** del PSD si algo se ve mal (colores, contorno, sombra).
4. Si puedes, la imagen original que falló.

---

## 10. Problemas frecuentes

**"Hay un problema en el bloque CONFIG".** El mensaje dice qué parámetro corregir. Lo más común es una coma de más o de menos, comillas en un número o un color de 5 o 7 caracteres.

**"No hay imágenes para procesar".** Las imágenes no están en `1_recorte`, `2_impresion` o `3_completa`, o tienen un formato no admitido (por ejemplo `.gif` o `.heic`). Conviértelas a JPG o PNG.

**Una imagen dice "El archivo está abierto en Photoshop".** Ciérrala en Photoshop y ejecuta de nuevo.

**Todo sale sin textura.** Falta `_Imagenes/_texturas/papel.png`. Cópiala desde la carpeta del proyecto.

**Muchas imágenes REVISAR con "selección del 99 %" o "100 %".** O Seleccionar sujeto falló de verdad (fondos muy cargados), o el control da falsos positivos. Si al abrir el PNG el recorte está bien, sube `LIMITE_SELECCION` a `100` y avísame.

**El recorte salió mal (se comió parte del sujeto o dejó fondo).** Abre el PSD y corrige la máscara de la capa "Foto" con el pincel (blanco muestra, negro oculta). El contorno y la sombra se actualizan solos. Después exporta con **Archivo > Exportar > Exportación rápida como PNG**.

**WebP no abre.** Las versiones antiguas de Photoshop no leen WebP. Actualiza Photoshop o convierte la imagen a PNG.

---

## 11. Para desarrolladores

La carpeta `desarrollo/` no hace falta para usar el script:

- `verificar.js`: comprueba que `QuincyFotos.jsx` sea ES3 válido (acorn, `ecmaVersion: 3`) y que no use funciones de JavaScript moderno. Comprueba también que todas las funciones llamadas existan y que las cadenas sean ASCII (los acentos van como `\uXXXX`, para que se vean bien sin depender de la codificación). Además, prueba en Node las funciones que no dependen de Photoshop: validación de CONFIG, nombres `_2`/`_3`, tamaños, mosaico de la textura, cobertura de la selección y registro.
  ```
  cd desarrollo
  npm install
  npm test
  ```
- `generar_papel.py`: genera `_texturas/papel.png` con ruido procedural filtrado en el dominio de Fourier (por eso no tiene costuras). Usa una semilla fija, así que el resultado es siempre el mismo.
  ```
  python3 generar_papel.py
  ```

El archivo `.jsx` se guarda en UTF-8 con BOM. Si lo editas, mantén esa codificación (el Bloc de notas la conserva).
