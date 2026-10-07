//@target photoshop
// ============================================================================
//  QuincyFotos.jsx  -  Prepara fotos y recortes para el canal.
//
//  Procesa en una sola pasada las carpetas 1_recorte, 2_impresion y 3_completa
//  de tu carpeta base (_Imagenes) y deja los resultados en _listas.
//  Instrucciones completas en README.md.
//
//  Este archivo es ExtendScript (JavaScript ES3). Si lo editas, cambia solo
//  los valores del bloque CONFIG.
// ============================================================================


// ============================================================================
//  CONFIG  -  Puedes cambiar estos valores.
//
//  Reglas para no romper el script:
//   * Cambia solo lo que está a la derecha de los dos puntos ( : ).
//   * Los colores van entre comillas, en hexadecimal de 6 letras: "1C1915".
//   * Los números van sin comillas: 1600.
//   * true = activado, false = desactivado (sin comillas).
//   * Cada línea termina en coma, menos la última antes de la llave final.
// ============================================================================
var CONFIG = {

    // Carpeta base. Déjalo en "" para que el script te la pida la primera vez
    // y la recuerde. Si prefieres escribirla aquí, usa barras normales ( / ):
    //   CARPETA_BASE: "C:/Users/TuNombre/Desktop/_Imagenes",
    CARPETA_BASE: "",

    // ---------------- Tamaños (en píxeles) ----------------

    // Alto final de cada recorte. Todos los recortes salen a este alto para que
    // el contorno se vea del mismo grosor en todos.
    ALTO_RECORTE: 1600,

    // true  = se mide el alto del SUJETO ya recortado (recomendado: el contorno
    //         queda igual aunque el sujeto ocupara poco espacio en la foto).
    // false = se mide el alto de la FOTO entera antes de recortar.
    NORMALIZAR_SUJETO: true,

    // Lado más largo de las fotos/documentos de 2_impresion (sin contar el borde).
    LADO_LARGO_IMPRESION: 1600,

    // Lado más largo de las imágenes de 3_completa. Nunca se amplían las más chicas.
    LADO_LARGO_COMPLETA: 3840,

    // ---------------- Colores ----------------

    // Color de la tinta: contorno y sombra.
    COLOR_TINTA: "1C1915",

    // Mapa de degradado (duotono): del más oscuro al más claro.
    // Puedes poner 2 colores o más.
    DUOTONO: ["1C1915", "8A6B4E", "F3E9D2"],

    // ---------------- Contorno y sombra ----------------

    // Grosor del contorno de los recortes (0 = sin contorno).
    CONTORNO_PX: 10,

    // Sombra paralela de recortes e impresiones.
    //   distancia: píxeles que se desplaza la sombra.
    //   angulo:    dirección de la luz en grados (135 = luz arriba a la izquierda,
    //              la sombra cae abajo a la derecha).
    //   opacidad:  0 a 100 (0 = sin sombra).
    //   suavidad:  desenfoque de la sombra en píxeles (0 = sombra dura).
    SOMBRA: { distancia: 8, angulo: 135, opacidad: 30, suavidad: 0 },

    // ---------------- Papel ----------------

    // Borde de papel alrededor de las impresiones (0 = sin borde).
    BORDE_PAPEL_PX: 40,
    COLOR_PAPEL: "FBF7EE",

    // Opacidad de la textura papel.png (modo Multiplicar). 0 = sin textura.
    TEXTURA_PAPEL_OPACIDAD: 35,

    // Opacidad de la textura sobre el borde de papel (más suave que la de la foto).
    TEXTURA_BORDE_OPACIDAD: 20,

    // ---------------- Semitono ----------------

    // true = agrega una trama de puntos sutil. false = sin trama.
    SEMITONO_ACTIVO: true,
    // Radio de los puntos en píxeles (mínimo 4, máximo 127).
    SEMITONO_RADIO: 6,
    // Opacidad de la trama (modo Multiplicar).
    SEMITONO_OPACIDAD: 15,

    // ---------------- Guardado ----------------

    // true = además del PNG, guarda un PSD con capas (recorte e impresión).
    GUARDAR_PSD: true,

    // Calidad de los JPG de 3_completa (0 a 12; 12 es la máxima).
    CALIDAD_JPG: 11,

    // ---------------- Revisión automática ----------------

    // Si Seleccionar sujeto selecciona más de este % del lienzo, se marca REVISAR.
    LIMITE_SELECCION: 97,

    // Si una imagen se tiene que ampliar más de estas veces, se marca REVISAR
    // porque puede verse borrosa.
    AVISO_AMPLIACION: 2
};
// ============================== FIN DE CONFIG ==============================
//  No hace falta tocar nada de aquí para abajo.
// ============================================================================


var VERSION = "1.0";
var CANAL_SILUETA = "QF_Silueta";
var PERFIL_SRGB = "sRGB IEC61966-2.1";
var EXTENSIONES = ["jpg", "jpeg", "png", "webp", "tif", "tiff", "psd"];
var NOMBRE_TEXTURA = "papel.png";


// ============================================================================
//  Funciones puras (no usan Photoshop; se prueban en desarrollo/verificar.js)
// ============================================================================

function recortarEspacios(s) {
    return String(s).replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, "");
}

function esArreglo(v) {
    return Object.prototype.toString.call(v) === "[object Array]";
}

function esNumero(v) {
    return typeof v === "number" && !isNaN(v) && isFinite(v);
}

function normalizarHex(valor) {
    if (typeof valor !== "string") {
        return null;
    }
    var s = recortarEspacios(valor).replace(/^#/, "").toUpperCase();
    if (!/^[0-9A-F]{6}$/.test(s)) {
        return null;
    }
    return s;
}

function hexARgb(hex) {
    return [
        parseInt(hex.substr(0, 2), 16),
        parseInt(hex.substr(2, 2), 16),
        parseInt(hex.substr(4, 2), 16)
    ];
}

// Revisa CONFIG y devuelve { errores: [...], cfg: copia normalizada }.
function validarConfig(c) {
    var errores = [];
    var cfg = {};

    function numero(nombre, valor, min, max, entero) {
        if (!esNumero(valor)) {
            errores.push(nombre + " debe ser un n\u00famero (sin comillas).");
            return min;
        }
        if (entero && Math.round(valor) !== valor) {
            errores.push(nombre + " debe ser un n\u00famero entero (sin decimales).");
        }
        if (valor < min || valor > max) {
            errores.push(nombre + " debe estar entre " + min + " y " + max + " (ahora es " + valor + ").");
        }
        return valor;
    }

    function booleano(nombre, valor) {
        if (valor !== true && valor !== false) {
            errores.push(nombre + " debe ser true o false (sin comillas).");
            return false;
        }
        return valor;
    }

    function color(nombre, valor) {
        var h = normalizarHex(valor);
        if (h === null) {
            errores.push(nombre + " debe ser un color de 6 letras entre comillas, por ejemplo \"1C1915\" (ahora es " + valor + ").");
            return "000000";
        }
        return h;
    }

    if (c === null || typeof c !== "object") {
        return { errores: ["No se encontr\u00f3 el bloque CONFIG."], cfg: cfg };
    }

    if (typeof c.CARPETA_BASE === "undefined" || c.CARPETA_BASE === null) {
        cfg.CARPETA_BASE = "";
    } else if (typeof c.CARPETA_BASE !== "string") {
        errores.push("CARPETA_BASE debe ir entre comillas (o dejarse en \"\").");
        cfg.CARPETA_BASE = "";
    } else {
        cfg.CARPETA_BASE = recortarEspacios(c.CARPETA_BASE);
        if (cfg.CARPETA_BASE.indexOf("\\") >= 0) {
            errores.push("CARPETA_BASE debe usar barras normales ( / ), no barras invertidas ( \\ ).");
        }
    }

    cfg.ALTO_RECORTE = numero("ALTO_RECORTE", c.ALTO_RECORTE, 100, 10000, true);
    cfg.NORMALIZAR_SUJETO = booleano("NORMALIZAR_SUJETO", c.NORMALIZAR_SUJETO);
    cfg.LADO_LARGO_IMPRESION = numero("LADO_LARGO_IMPRESION", c.LADO_LARGO_IMPRESION, 100, 10000, true);
    cfg.LADO_LARGO_COMPLETA = numero("LADO_LARGO_COMPLETA", c.LADO_LARGO_COMPLETA, 100, 30000, true);

    cfg.COLOR_TINTA = color("COLOR_TINTA", c.COLOR_TINTA);
    cfg.DUOTONO = [];
    if (!esArreglo(c.DUOTONO) || c.DUOTONO.length < 2 || c.DUOTONO.length > 10) {
        errores.push("DUOTONO debe ser una lista de 2 a 10 colores entre corchetes, por ejemplo [\"1C1915\", \"8A6B4E\", \"F3E9D2\"].");
    } else {
        for (var i = 0; i < c.DUOTONO.length; i++) {
            cfg.DUOTONO.push(color("DUOTONO (color " + (i + 1) + ")", c.DUOTONO[i]));
        }
    }

    cfg.CONTORNO_PX = numero("CONTORNO_PX", c.CONTORNO_PX, 0, 250, true);

    var s = c.SOMBRA;
    if (s === null || typeof s !== "object" || esArreglo(s)) {
        errores.push("SOMBRA debe tener la forma { distancia: 8, angulo: 135, opacidad: 30, suavidad: 0 }.");
        cfg.SOMBRA = { distancia: 0, angulo: 135, opacidad: 0, suavidad: 0 };
    } else {
        cfg.SOMBRA = {
            distancia: numero("SOMBRA.distancia", s.distancia, 0, 3000, true),
            angulo: numero("SOMBRA.angulo", s.angulo, -360, 360, false),
            opacidad: numero("SOMBRA.opacidad", s.opacidad, 0, 100, false),
            suavidad: numero("SOMBRA.suavidad", s.suavidad, 0, 250, true)
        };
        if (esNumero(cfg.SOMBRA.angulo)) {
            if (cfg.SOMBRA.angulo > 180) { cfg.SOMBRA.angulo -= 360; }
            if (cfg.SOMBRA.angulo < -180) { cfg.SOMBRA.angulo += 360; }
        }
    }

    cfg.BORDE_PAPEL_PX = numero("BORDE_PAPEL_PX", c.BORDE_PAPEL_PX, 0, 2000, true);
    cfg.COLOR_PAPEL = color("COLOR_PAPEL", c.COLOR_PAPEL);
    cfg.TEXTURA_PAPEL_OPACIDAD = numero("TEXTURA_PAPEL_OPACIDAD", c.TEXTURA_PAPEL_OPACIDAD, 0, 100, false);
    cfg.TEXTURA_BORDE_OPACIDAD = numero("TEXTURA_BORDE_OPACIDAD", c.TEXTURA_BORDE_OPACIDAD, 0, 100, false);

    cfg.SEMITONO_ACTIVO = booleano("SEMITONO_ACTIVO", c.SEMITONO_ACTIVO);
    cfg.SEMITONO_RADIO = numero("SEMITONO_RADIO", c.SEMITONO_RADIO, 4, 127, true);
    cfg.SEMITONO_OPACIDAD = numero("SEMITONO_OPACIDAD", c.SEMITONO_OPACIDAD, 0, 100, false);

    cfg.GUARDAR_PSD = booleano("GUARDAR_PSD", c.GUARDAR_PSD);
    cfg.CALIDAD_JPG = numero("CALIDAD_JPG", c.CALIDAD_JPG, 0, 12, true);

    cfg.LIMITE_SELECCION = numero("LIMITE_SELECCION", c.LIMITE_SELECCION, 1, 100, false);
    cfg.AVISO_AMPLIACION = numero("AVISO_AMPLIACION", c.AVISO_AMPLIACION, 1, 100, false);

    return { errores: errores, cfg: cfg };
}

function extensionDe(nombre) {
    var i = nombre.lastIndexOf(".");
    if (i <= 0) {
        return "";
    }
    return nombre.substr(i + 1);
}

function nombreBase(nombre) {
    var i = nombre.lastIndexOf(".");
    if (i <= 0) {
        return nombre;
    }
    return nombre.substr(0, i);
}

function esImagenValida(nombre) {
    if (!nombre || nombre.charAt(0) === "." || nombre.substr(0, 2) === "~$") {
        return false;
    }
    var ext = extensionDe(nombre).toLowerCase();
    for (var i = 0; i < EXTENSIONES.length; i++) {
        if (EXTENSIONES[i] === ext) {
            return true;
        }
    }
    return false;
}

// Devuelve "base", "base_2", "base_3"... el primero para el que no exista
// ningún archivo con las extensiones dadas. existe(nombreConExtension) -> bool.
function nombreLibre(base, extensiones, existe) {
    for (var n = 1; n < 10000; n++) {
        var candidato = (n === 1) ? base : base + "_" + n;
        var ocupado = false;
        for (var i = 0; i < extensiones.length; i++) {
            if (existe(candidato + "." + extensiones[i])) {
                ocupado = true;
                break;
            }
        }
        if (!ocupado) {
            return candidato;
        }
    }
    throw new Error("No se encontr\u00f3 un nombre libre para " + base);
}

// Tamaño para que el alto sea exactamente "alto", manteniendo la proporción.
function dimsAlto(w, h, alto) {
    return { ancho: Math.max(1, Math.round(w * alto / h)), alto: alto, escala: alto / h };
}

// Tamaño para que el lado largo mida "lado". Si ampliar es false, nunca agranda.
function dimsLadoLargo(w, h, lado, ampliar) {
    var largo = Math.max(w, h);
    if (!ampliar && largo <= lado) {
        return { ancho: w, alto: h, escala: 1 };
    }
    var k = lado / largo;
    if (w >= h) {
        return { ancho: lado, alto: Math.max(1, Math.round(h * k)), escala: k };
    }
    return { ancho: Math.max(1, Math.round(w * k)), alto: lado, escala: k };
}

// Alto al que se lleva la foto antes de Seleccionar sujeto.
// Sin normalizar el sujeto: directamente ALTO_RECORTE (lo que pide el flujo
// básico). Normalizando el sujeto: se conserva más resolución (hasta 2 veces
// ALTO_RECORTE) para no perder detalle al recortar y volver a escalar.
function altoDeTrabajo(h, alto, normalizarSujeto) {
    if (!normalizarSujeto) {
        return alto;
    }
    if (h < alto) {
        return alto;
    }
    if (h > 2 * alto) {
        return 2 * alto;
    }
    return h;
}

// Fracción del lienzo que ocupa la selección (0 a 1).
// histograma: arreglo de 256 cuentas tomadas con la selección activa.
// Si el histograma no es fiable, usa la proporción del rectángulo que la contiene.
function calcularCobertura(histograma, total, proporcionRectangulo) {
    if (!histograma || histograma.length !== 256 || !(total > 0)) {
        return proporcionRectangulo;
    }
    var suma = 0;
    for (var i = 0; i < 256; i++) {
        suma += histograma[i];
    }
    var r = suma / total;
    // La selección real nunca puede ocupar más que su rectángulo.
    if (!(r > 0) || r > proporcionRectangulo + 0.01) {
        return proporcionRectangulo;
    }
    return r;
}

// Redondea los límites de una selección hacia afuera y los ajusta al lienzo.
function redondearLimites(b, w, h) {
    var l = Math.max(0, Math.floor(b[0]));
    var t = Math.max(0, Math.floor(b[1]));
    var r = Math.min(w, Math.ceil(b[2]));
    var a = Math.min(h, Math.ceil(b[3]));
    if (l >= w) { l = w - 1; }
    if (t >= h) { t = h - 1; }
    if (r <= l) { r = l + 1; }
    if (a <= t) { a = t + 1; }
    return [l, t, r, a];
}

// Posiciones (esquina superior izquierda) de las copias de la textura
// necesarias para cubrir un lienzo de w x h.
function posicionesMosaico(w, h, tw, th) {
    var r = [];
    for (var y = 0; y < h; y += th) {
        for (var x = 0; x < w; x += tw) {
            r.push([x, y]);
        }
    }
    return r;
}

// Ubicación de cada color del degradado en la escala de Photoshop (0 a 4096).
function posicionesDegradado(n) {
    var r = [];
    for (var i = 0; i < n; i++) {
        r.push(Math.round(i * 4096 / (n - 1)));
    }
    return r;
}

function margenRecorte(cfg) {
    return cfg.CONTORNO_PX + cfg.SOMBRA.distancia + cfg.SOMBRA.suavidad + 20;
}

function margenImpresion(cfg) {
    return cfg.SOMBRA.distancia + cfg.SOMBRA.suavidad + 20;
}

// Decide qué hacer con la carpeta que eligió el usuario:
// "usar" (es la carpeta base), "sub" (usar su subcarpeta _Imagenes) o "preguntar".
function decidirCarpetaBase(nombre, tieneEstructura, tieneSubImagenes) {
    if (tieneEstructura) {
        return "usar";
    }
    if (String(nombre).toLowerCase() === "_imagenes") {
        return "usar";
    }
    if (tieneSubImagenes) {
        return "sub";
    }
    return "preguntar";
}

function rellenar(s, n) {
    s = String(s);
    while (s.length < n) {
        s += " ";
    }
    return s;
}

function dosCifras(n) {
    return (n < 10 ? "0" : "") + n;
}

function fechaHora(d) {
    return d.getFullYear() + "-" + dosCifras(d.getMonth() + 1) + "-" + dosCifras(d.getDate()) +
        " " + dosCifras(d.getHours()) + ":" + dosCifras(d.getMinutes()) + ":" + dosCifras(d.getSeconds());
}

function lineaRegistro(fecha, tipo, tratamiento, archivo, detalle) {
    var s = fecha + "  " + rellenar(tipo, 8) + rellenar(tratamiento, 10) + archivo;
    if (detalle) {
        s += "  ->  " + detalle;
    }
    return s;
}

function textoError(e) {
    var s = (e && e.message) ? e.message : String(e);
    if (e && e.line) {
        s += " (l\u00ednea " + e.line + ")";
    }
    return s;
}

// Convierte la configuración en texto de una línea para el registro.
function resumenConfig(cfg) {
    var partes = [];
    for (var k in cfg) {
        if (!cfg.hasOwnProperty(k)) {
            continue;
        }
        var v = cfg[k];
        if (esArreglo(v)) {
            v = "[" + v.join(",") + "]";
        } else if (v !== null && typeof v === "object") {
            var sub = [];
            for (var k2 in v) {
                if (v.hasOwnProperty(k2)) {
                    sub.push(k2 + ":" + v[k2]);
                }
            }
            v = "{" + sub.join(",") + "}";
        }
        partes.push(k + "=" + v);
    }
    return partes.join("  ");
}

function nuevaCuenta() {
    return { procesadas: 0, revisar: 0, fallidas: 0 };
}

// Texto de la alerta final.
function textoResumen(tratamientos, cuentas, avisosGlobales, rutaRegistro) {
    var lineas = ["QuincyFotos termin\u00f3.", ""];
    var tp = 0, tr = 0, tf = 0;
    for (var i = 0; i < tratamientos.length; i++) {
        var t = tratamientos[i];
        var c = cuentas[t.id];
        tp += c.procesadas;
        tr += c.revisar;
        tf += c.fallidas;
        lineas.push(t.titulo + ": " + c.procesadas + " procesadas (" + c.revisar +
            " para revisar), " + c.fallidas + " fallidas");
    }
    lineas.push("");
    lineas.push("Total: " + tp + " procesadas, " + tr + " para revisar, " + tf + " fallidas.");
    for (var j = 0; j < avisosGlobales.length; j++) {
        lineas.push("");
        lineas.push("AVISO: " + avisosGlobales[j]);
    }
    if (tr > 0 || tf > 0) {
        lineas.push("");
        lineas.push("Busca las l\u00edneas REVISAR y ERROR en el registro:");
    } else {
        lineas.push("");
        lineas.push("Registro:");
    }
    lineas.push(rutaRegistro);
    return lineas.join("\n");
}

function listaTratamientos() {
    return [
        { id: "recorte", titulo: "Recorte", entrada: "1_recorte", salida: "recorte", procesar: procesarRecorte },
        { id: "impresion", titulo: "Impresi\u00f3n", entrada: "2_impresion", salida: "impresion", procesar: procesarImpresion },
        { id: "completa", titulo: "Completa", entrada: "3_completa", salida: "completa", procesar: procesarCompleta }
    ];
}

// Subcarpetas que el script crea dentro de la carpeta base.
function rutasEstructura() {
    var t = listaTratamientos();
    var r = [];
    var i;
    for (i = 0; i < t.length; i++) { r.push(t[i].entrada); }
    r.push("_listas");
    for (i = 0; i < t.length; i++) { r.push("_listas/" + t[i].salida); }
    r.push("_procesadas");
    for (i = 0; i < t.length; i++) { r.push("_procesadas/" + t[i].entrada); }
    r.push("_texturas");
    return r;
}


// ============================================================================
//  Utilidades de archivos y carpetas (ExtendScript)
// ============================================================================

function hijo(carpeta, nombre) {
    return carpeta.fullName + "/" + File.encode(nombre);
}

function existeEn(carpeta) {
    return function (nombre) {
        return new File(hijo(carpeta, nombre)).exists;
    };
}

function escribirLinea(archivo, linea) {
    try {
        archivo.encoding = "UTF-8";
        archivo.lineFeed = "Windows";
        if (archivo.open("a")) {
            archivo.writeln(linea);
            archivo.close();
        }
    } catch (e) {
        // Si no se puede escribir el registro, se sigue procesando igual.
    }
}

function archivoPreferencias() {
    var dir = new Folder(Folder.userData.fullName + "/QuincyFotos");
    if (!dir.exists) {
        dir.create();
    }
    return new File(dir.fullName + "/carpeta_base.txt");
}

function leerCarpetaGuardada() {
    try {
        var f = archivoPreferencias();
        if (!f.exists) {
            return null;
        }
        f.encoding = "UTF-8";
        if (!f.open("r")) {
            return null;
        }
        var t = recortarEspacios(f.read());
        f.close();
        if (!t) {
            return null;
        }
        var d = new Folder(t);
        return d.exists ? d : null;
    } catch (e) {
        return null;
    }
}

function guardarCarpetaElegida(carpeta) {
    try {
        var f = archivoPreferencias();
        f.encoding = "UTF-8";
        if (f.open("w")) {
            f.write(carpeta.absoluteURI);
            f.close();
        }
    } catch (e) {
        // Si no se puede guardar, la próxima vez se volverá a preguntar.
    }
}

function shiftPresionado() {
    try {
        return ScriptUI.environment.keyboardState.shiftKey === true;
    } catch (e) {
        return false;
    }
}

function obtenerCarpetaBase(cfg) {
    if (cfg.CARPETA_BASE) {
        var fija = new Folder(cfg.CARPETA_BASE);
        if (!fija.exists && !fija.create()) {
            alert("No se pudo encontrar ni crear la carpeta de CARPETA_BASE:\n" + cfg.CARPETA_BASE, "QuincyFotos");
            return null;
        }
        return fija;
    }

    var forzar = shiftPresionado();
    if (!forzar) {
        var guardada = leerCarpetaGuardada();
        if (guardada) {
            return guardada;
        }
    }

    var elegida = Folder.selectDialog("QuincyFotos: elige tu carpeta base (_Imagenes)");
    if (!elegida) {
        return null;
    }

    var tieneEstructura = new Folder(elegida.fullName + "/1_recorte").exists ||
        new Folder(elegida.fullName + "/_listas").exists;
    var sub = new Folder(elegida.fullName + "/_Imagenes");
    var decision = decidirCarpetaBase(File.decode(elegida.name), tieneEstructura, sub.exists);

    if (decision === "sub") {
        elegida = sub;
    } else if (decision === "preguntar") {
        var crear = confirm("La carpeta elegida no se llama _Imagenes:\n" + elegida.fsName +
            "\n\n\u00bfCrear una carpeta _Imagenes dentro de ella y usarla como base?\n\n" +
            "S\u00ed = crear _Imagenes dentro.\nNo = usar la carpeta elegida tal cual.", false, "QuincyFotos");
        if (crear) {
            elegida = sub;
            if (!elegida.exists && !elegida.create()) {
                alert("No se pudo crear la carpeta:\n" + elegida.fsName, "QuincyFotos");
                return null;
            }
        }
    }

    guardarCarpetaElegida(elegida);
    return elegida;
}

function crearEstructura(base) {
    var rutas = rutasEstructura();
    for (var i = 0; i < rutas.length; i++) {
        var f = new Folder(base.fullName + "/" + rutas[i]);
        if (!f.exists && !f.create()) {
            throw new Error("No se pudo crear la carpeta " + f.fsName);
        }
    }
    var t = listaTratamientos();
    var c = { entrada: {}, salida: {}, procesadas: {}, texturas: null, registro: null };
    for (var j = 0; j < t.length; j++) {
        c.entrada[t[j].id] = new Folder(base.fullName + "/" + t[j].entrada);
        c.salida[t[j].id] = new Folder(base.fullName + "/_listas/" + t[j].salida);
        c.procesadas[t[j].id] = new Folder(base.fullName + "/_procesadas/" + t[j].entrada);
    }
    c.texturas = new Folder(base.fullName + "/_texturas");
    c.registro = new File(base.fullName + "/registro.txt");
    return c;
}

function listarImagenes(carpeta) {
    var todos = carpeta.getFiles();
    var r = [];
    for (var i = 0; i < todos.length; i++) {
        var f = todos[i];
        if (!(f instanceof File)) {
            continue;
        }
        if (f.hidden) {
            continue;
        }
        if (esImagenValida(File.decode(f.name))) {
            r.push(f);
        }
    }
    r.sort(function (a, b) {
        var x = File.decode(a.name).toLowerCase();
        var y = File.decode(b.name).toLowerCase();
        return x < y ? -1 : (x > y ? 1 : 0);
    });
    return r;
}

// Busca papel.png en la carpeta base. Si no está pero hay una junto al script,
// la copia allí.
function prepararTextura(carpetas) {
    var t = new File(carpetas.texturas.fullName + "/" + NOMBRE_TEXTURA);
    if (t.exists) {
        return t;
    }
    try {
        var junto = new File(new File($.fileName).parent.fullName + "/_texturas/" + NOMBRE_TEXTURA);
        if (junto.exists && junto.copy(t)) {
            return new File(t.fullName);
        }
    } catch (e) {
        // Sin textura.
    }
    return null;
}

// Mueve el original a _procesadas: copia, comprueba la copia y solo entonces
// borra el original. Nunca sobrescribe.
function moverOriginal(archivo, destinoCarpeta) {
    try {
        var nombre = File.decode(archivo.name);
        var ext = extensionDe(nombre);
        var libre = nombreLibre(nombreBase(nombre), [ext], existeEn(destinoCarpeta));
        var destino = new File(hijo(destinoCarpeta, libre + "." + ext));
        var tam = archivo.length;
        if (!archivo.copy(destino)) {
            return { ok: false, mensaje: "No se pudo copiar el original a _procesadas (" + archivo.error + "). Sigue en su carpeta: mu\u00e9velo a mano para no procesarlo dos veces." };
        }
        var copia = new File(destino.fullName);
        if (!copia.exists || copia.length !== tam) {
            return { ok: false, mensaje: "La copia en _procesadas no coincide con el original. El original sigue en su carpeta; rev\u00edsalo." };
        }
        if (!archivo.remove()) {
            return { ok: false, mensaje: "Se copi\u00f3 a _procesadas pero no se pudo quitar el original (\u00bfest\u00e1 abierto en otro programa?). B\u00f3rralo a mano para no procesarlo dos veces." };
        }
        return { ok: true, mensaje: "" };
    } catch (e) {
        return { ok: false, mensaje: "No se pudo mover el original: " + textoError(e) };
    }
}

function borrarSalidas(salidas) {
    for (var i = 0; i < salidas.length; i++) {
        try {
            if (salidas[i].exists) {
                salidas[i].remove();
            }
        } catch (e) {
            // Nada.
        }
    }
}

function documentoYaAbierto(archivo) {
    var ruta = archivo.fsName.toLowerCase();
    for (var i = 0; i < app.documents.length; i++) {
        try {
            if (app.documents[i].fullName.fsName.toLowerCase() === ruta) {
                return true;
            }
        } catch (e) {
            // Documento sin guardar: no tiene ruta.
        }
    }
    return false;
}


// ============================================================================
//  Utilidades de Photoshop (DOM)
// ============================================================================

function aPx(v) {
    if (typeof v === "number") {
        return v;
    }
    return v.as("px");
}

function anchoDoc(doc) {
    return Math.round(aPx(doc.width));
}

function altoDoc(doc) {
    return Math.round(aPx(doc.height));
}

function metodoRemuestreo() {
    if (typeof ResampleMethod.BICUBICAUTOMATIC !== "undefined") {
        return ResampleMethod.BICUBICAUTOMATIC;
    }
    return ResampleMethod.BICUBIC;
}

function redimensionar(doc, w, h) {
    if (anchoDoc(doc) === w && altoDoc(doc) === h) {
        return;
    }
    doc.resizeImage(new UnitValue(w, "px"), new UnitValue(h, "px"), doc.resolution, metodoRemuestreo());
}

function agregarLienzo(doc, margen) {
    if (margen <= 0) {
        return;
    }
    doc.resizeCanvas(new UnitValue(anchoDoc(doc) + 2 * margen, "px"),
        new UnitValue(altoDoc(doc) + 2 * margen, "px"), AnchorPosition.MIDDLECENTER);
}

function colorSolido(hex) {
    var c = new SolidColor();
    c.rgb.hexValue = hex;
    return c;
}

function cerrarSinGuardar(doc) {
    try {
        doc.close(SaveOptions.DONOTSAVECHANGES);
    } catch (e) {
        // Ya estaba cerrado.
    }
}

function limitesSeleccion(doc) {
    try {
        var b = doc.selection.bounds;
        var r = [aPx(b[0]), aPx(b[1]), aPx(b[2]), aPx(b[3])];
        if (r[2] - r[0] < 1 || r[3] - r[1] < 1) {
            return null;
        }
        return r;
    } catch (e) {
        return null;
    }
}

function histogramaSeguro(doc) {
    try {
        return doc.histogram;
    } catch (e) {
        return null;
    }
}

// Deja el documento en RGB, 8 bits, sRGB, una sola capa normal llamada "Foto".
function normalizarDocumento(doc, res) {
    app.activeDocument = doc;
    if (!(doc.layers.length === 1 && doc.layers[0].isBackgroundLayer)) {
        doc.flatten();
    }
    if (doc.mode !== DocumentMode.RGB) {
        if (doc.mode === DocumentMode.BITMAP) {
            doc.changeMode(ChangeMode.GRAYSCALE);
        }
        doc.changeMode(ChangeMode.RGB);
    }
    if (doc.bitsPerChannel !== BitsPerChannelType.EIGHT) {
        doc.bitsPerChannel = BitsPerChannelType.EIGHT;
    }
    try {
        doc.convertProfile(PERFIL_SRGB, Intent.RELATIVECOLORIMETRIC, true, false);
    } catch (e) {
        res.avisos.push("No se pudo convertir a sRGB (" + textoError(e) + "); los colores pueden variar un poco.");
    }
    var capa = doc.layers[0];
    if (capa.isBackgroundLayer) {
        capa.isBackgroundLayer = false;
    }
    capa.name = "Foto";
    doc.activeLayer = capa;
    return capa;
}

// Activa la máscara de recorte (clipping) con la capa de abajo.
function recortarEnCapaInferior(capa) {
    capa.grouped = true;
    if (capa.grouped !== true) {
        throw new Error("No se pudo crear la m\u00e1scara de recorte de la capa " + capa.name);
    }
}

function avisarAmpliacion(factor, cfg, res, que) {
    if (factor > cfg.AVISO_AMPLIACION) {
        res.revisar.push(que + " ampliada x" + (Math.round(factor * 10) / 10) + ": puede verse borrosa");
    }
}


// ============================================================================
//  ActionManager (independiente del idioma de Photoshop)
// ============================================================================

function cTID(s) {
    return charIDToTypeID(s);
}

function sTID(s) {
    return stringIDToTypeID(s);
}

function descColorRGB(hex) {
    var rgb = hexARgb(hex);
    var d = new ActionDescriptor();
    d.putDouble(cTID("Rd  "), rgb[0]);
    d.putDouble(cTID("Grn "), rgb[1]);
    d.putDouble(cTID("Bl  "), rgb[2]);
    return d;
}

// Selección > Sujeto.
function seleccionarSujeto() {
    var d = new ActionDescriptor();
    d.putBoolean(sTID("sampleAllLayers"), false);
    executeAction(sTID("autoCutout"), d, DialogModes.NO);
}

// Selección > Guardar selección (en un canal alfa con nombre).
function guardarSeleccionEnCanal(nombre) {
    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putProperty(cTID("Chnl"), cTID("fsel"));
    d.putReference(cTID("null"), r);
    d.putString(cTID("Nm  "), nombre);
    executeAction(cTID("Dplc"), d, DialogModes.NO);
}

// Selección > Cargar selección (desde un canal alfa con nombre).
function cargarSeleccionDeCanal(nombre) {
    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putProperty(cTID("Chnl"), cTID("fsel"));
    d.putReference(cTID("null"), r);
    var r2 = new ActionReference();
    r2.putName(cTID("Chnl"), nombre);
    d.putReference(cTID("T   "), r2);
    executeAction(cTID("setd"), d, DialogModes.NO);
}

// Vuelve a apuntar al compuesto RGB (por si quedó activo un canal alfa o una máscara).
function seleccionarCompuestoRGB() {
    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putEnumerated(cTID("Chnl"), cTID("Chnl"), cTID("RGB "));
    d.putReference(cTID("null"), r);
    executeAction(cTID("slct"), d, DialogModes.NO);
}

// Capa > Máscara de capa > Descubrir selección.
function crearMascaraDesdeSeleccion() {
    var d = new ActionDescriptor();
    d.putClass(cTID("Nw  "), cTID("Chnl"));
    var r = new ActionReference();
    r.putEnumerated(cTID("Chnl"), cTID("Chnl"), cTID("Msk "));
    d.putReference(cTID("At  "), r);
    d.putEnumerated(cTID("Usng"), cTID("UsrM"), cTID("RvlS"));
    executeAction(cTID("Mk  "), d, DialogModes.NO);
}

// Capa > Nueva capa de ajuste > Mapa de degradado, con los colores dados.
function crearCapaMapaDegradado(colores) {
    var posiciones = posicionesDegradado(colores.length);

    var grad = new ActionDescriptor();
    grad.putString(cTID("Nm  "), "QuincyFotos");
    grad.putEnumerated(cTID("GrdF"), cTID("GrdF"), cTID("CstS"));
    grad.putDouble(cTID("Intr"), 4096);

    var listaColores = new ActionList();
    for (var i = 0; i < colores.length; i++) {
        var parada = new ActionDescriptor();
        parada.putObject(cTID("Clr "), cTID("RGBC"), descColorRGB(colores[i]));
        parada.putEnumerated(cTID("Type"), cTID("Clry"), cTID("UsrS"));
        parada.putInteger(cTID("Lctn"), posiciones[i]);
        parada.putInteger(cTID("Mdpn"), 50);
        listaColores.putObject(cTID("Clrt"), parada);
    }
    grad.putList(cTID("Clrs"), listaColores);

    var listaOpacidad = new ActionList();
    var extremos = [0, 4096];
    for (var j = 0; j < extremos.length; j++) {
        var op = new ActionDescriptor();
        op.putUnitDouble(cTID("Opct"), cTID("#Prc"), 100);
        op.putInteger(cTID("Lctn"), extremos[j]);
        op.putInteger(cTID("Mdpn"), 50);
        listaOpacidad.putObject(cTID("TrnS"), op);
    }
    grad.putList(cTID("Trns"), listaOpacidad);

    var mapa = new ActionDescriptor();
    mapa.putObject(cTID("Grad"), cTID("Grdn"), grad);

    var tipo = new ActionDescriptor();
    tipo.putObject(cTID("Type"), cTID("GdMp"), mapa);

    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putClass(cTID("AdjL"));
    d.putReference(cTID("null"), r);
    d.putObject(cTID("Usng"), cTID("AdjL"), tipo);
    executeAction(cTID("Mk  "), d, DialogModes.NO);
}

// Filtro > Pixelizar > Semitono de color. Los 4 ángulos iguales hacen que una
// capa gris dé puntos grises (con los ángulos por defecto saldrían de colores).
function filtroSemitonoDeColor(radio) {
    var d = new ActionDescriptor();
    d.putInteger(cTID("Rds "), radio);
    d.putInteger(cTID("Ang1"), 45);
    d.putInteger(cTID("Ang2"), 45);
    d.putInteger(cTID("Ang3"), 45);
    d.putInteger(cTID("Ang4"), 45);
    executeAction(cTID("ClrH"), d, DialogModes.NO);
}

// Selección > Todas las capas.
function seleccionarTodasLasCapas() {
    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putEnumerated(cTID("Lyr "), cTID("Ordn"), cTID("Trgt"));
    d.putReference(cTID("null"), r);
    executeAction(sTID("selectAllLayers"), d, DialogModes.NO);
}

// Capa > Agrupar capas (Ctrl+G) con las capas seleccionadas.
function agruparCapasSeleccionadas() {
    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putClass(sTID("layerSection"));
    d.putReference(cTID("null"), r);
    var r2 = new ActionReference();
    r2.putEnumerated(cTID("Lyr "), cTID("Ordn"), cTID("Trgt"));
    d.putReference(cTID("From"), r2);
    executeAction(cTID("Mk  "), d, DialogModes.NO);
}

// Estilo de capa en la capa activa: Trazo por fuera y/o Sombra paralela.
function aplicarEstiloCapaActiva(cfg, conTrazo, conSombra) {
    var fx = new ActionDescriptor();
    fx.putUnitDouble(cTID("Scl "), cTID("#Prc"), 100);

    if (conTrazo) {
        var st = new ActionDescriptor();
        st.putBoolean(cTID("enab"), true);
        st.putEnumerated(cTID("Styl"), cTID("FStl"), cTID("OutF"));
        st.putEnumerated(cTID("PntT"), cTID("FrFl"), cTID("SClr"));
        st.putEnumerated(cTID("Md  "), cTID("BlnM"), cTID("Nrml"));
        st.putUnitDouble(cTID("Opct"), cTID("#Prc"), 100);
        st.putUnitDouble(cTID("Sz  "), cTID("#Pxl"), cfg.CONTORNO_PX);
        st.putObject(cTID("Clr "), cTID("RGBC"), descColorRGB(cfg.COLOR_TINTA));
        fx.putObject(cTID("FrFX"), cTID("FrFX"), st);
    }

    if (conSombra) {
        var ds = new ActionDescriptor();
        ds.putBoolean(cTID("enab"), true);
        ds.putEnumerated(cTID("Md  "), cTID("BlnM"), cTID("Mltp"));
        ds.putObject(cTID("Clr "), cTID("RGBC"), descColorRGB(cfg.COLOR_TINTA));
        ds.putUnitDouble(cTID("Opct"), cTID("#Prc"), cfg.SOMBRA.opacidad);
        ds.putBoolean(cTID("uglg"), false);
        ds.putUnitDouble(cTID("lagl"), cTID("#Ang"), cfg.SOMBRA.angulo);
        ds.putUnitDouble(cTID("Dstn"), cTID("#Pxl"), cfg.SOMBRA.distancia);
        ds.putUnitDouble(cTID("blur"), cTID("#Pxl"), cfg.SOMBRA.suavidad);
        fx.putObject(cTID("DrSh"), cTID("DrSh"), ds);
    }

    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putProperty(cTID("Prpr"), cTID("Lefx"));
    r.putEnumerated(cTID("Lyr "), cTID("Ordn"), cTID("Trgt"));
    d.putReference(cTID("null"), r);
    d.putObject(cTID("T   "), cTID("Lefx"), fx);
    executeAction(cTID("setd"), d, DialogModes.NO);
}


// ============================================================================
//  Pasos de los tratamientos
// ============================================================================

// Mapa de degradado recortado a "foto". Queda como capa de ajuste editable.
function crearDuotono(doc, foto, cfg) {
    app.activeDocument = doc;
    doc.selection.deselect();
    doc.activeLayer = foto;
    crearCapaMapaDegradado(cfg.DUOTONO);
    var capa = doc.activeLayer;
    capa.name = "Duotono";
    recortarEnCapaInferior(capa);
    return capa;
}

// Copia de la foto, desaturada, con Semitono de color, en Multiplicar,
// colocada encima de "encima" y recortada a la foto.
function crearSemitono(doc, foto, encima, cfg) {
    app.activeDocument = doc;
    doc.selection.deselect();
    var s = foto.duplicate(encima, ElementPlacement.PLACEBEFORE);
    try {
        s.name = "Semitono";
        doc.activeLayer = s;
        seleccionarCompuestoRGB();
        s.desaturate();
        filtroSemitonoDeColor(cfg.SEMITONO_RADIO);
        s.desaturate();
        s.blendMode = BlendMode.MULTIPLY;
        s.opacity = cfg.SEMITONO_OPACIDAD;
        recortarEnCapaInferior(s);
    } catch (e) {
        try { s.remove(); } catch (e2) { /* nada */ }
        throw e;
    }
    return s;
}

// Abre papel.png, lo repite en mosaico hasta cubrir el lienzo y lo deja como
// una sola capa arriba de todo, en Multiplicar y recortada a la capa de abajo.
function agregarPapel(doc, archivoTextura, opacidad, nombre) {
    app.activeDocument = doc;
    doc.selection.deselect();
    var w = anchoDoc(doc);
    var h = altoDoc(doc);
    var capasAntes = doc.layers.length;
    var papel = null;
    var capa = null;
    try {
        papel = app.open(archivoTextura);
        app.activeDocument = papel;
        if (!(papel.layers.length === 1 && papel.layers[0].isBackgroundLayer)) {
            papel.flatten();
        }
        if (papel.mode !== DocumentMode.RGB) {
            papel.changeMode(ChangeMode.RGB);
        }
        if (papel.bitsPerChannel !== BitsPerChannelType.EIGHT) {
            papel.bitsPerChannel = BitsPerChannelType.EIGHT;
        }
        try {
            papel.convertProfile(PERFIL_SRGB, Intent.RELATIVECOLORIMETRIC, true, false);
        } catch (e0) {
            // Si no se puede, Photoshop convierte al copiar la capa.
        }
        var fuente = papel.layers[0];
        if (fuente.isBackgroundLayer) {
            fuente.isBackgroundLayer = false;
        }
        var pos = posicionesMosaico(w, h, anchoDoc(papel), altoDoc(papel));
        for (var i = 0; i < pos.length; i++) {
            app.activeDocument = papel;
            fuente.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
            app.activeDocument = doc;
            var t = doc.layers[0];
            var b = t.bounds;
            t.translate(pos[i][0] - aPx(b[0]), pos[i][1] - aPx(b[1]));
            if (i > 0) {
                t.merge();
            }
        }
        app.activeDocument = doc;
        capa = doc.layers[0];
        capa.name = nombre;
        capa.blendMode = BlendMode.MULTIPLY;
        capa.opacity = opacidad;
        recortarEnCapaInferior(capa);
    } catch (e) {
        try {
            app.activeDocument = doc;
            while (doc.layers.length > capasAntes) {
                doc.layers[0].remove();
            }
        } catch (e2) {
            // nada
        }
        throw e;
    } finally {
        if (papel) {
            cerrarSinGuardar(papel);
        }
        app.activeDocument = doc;
    }
    return capa;
}

// Ejecuta un paso opcional. Si falla, se anota como REVISAR y se sigue.
function pasoOpcional(res, nombre, fn) {
    res.paso = nombre;
    try {
        return fn();
    } catch (e) {
        res.revisar.push(nombre + " omitido por un error: " + textoError(e));
        return null;
    }
}

function agregarSemitonoOpcional(doc, foto, encima, ctx, res) {
    if (!ctx.cfg.SEMITONO_ACTIVO || ctx.cfg.SEMITONO_OPACIDAD <= 0) {
        return null;
    }
    return pasoOpcional(res, "Semitono", function () {
        return crearSemitono(doc, foto, encima, ctx.cfg);
    });
}

function agregarPapelOpcional(doc, ctx, res, opacidad, nombre) {
    if (!ctx.textura || opacidad <= 0) {
        return null;
    }
    return pasoOpcional(res, "Textura de papel", function () {
        return agregarPapel(doc, ctx.textura, opacidad, nombre);
    });
}

// Selecciona el sujeto, lo revisa y guarda la selección en un canal alfa.
function detectarSujeto(doc, cfg, res) {
    var r = { ok: false, limites: null };
    doc.selection.deselect();
    try {
        seleccionarSujeto();
    } catch (e) {
        res.revisar.push("Seleccionar sujeto fall\u00f3 (" + textoError(e) + "); se guard\u00f3 la imagen sin recortar");
        return r;
    }
    var b = limitesSeleccion(doc);
    if (!b) {
        res.revisar.push("Seleccionar sujeto no encontr\u00f3 ning\u00fan sujeto; se guard\u00f3 la imagen sin recortar");
        return r;
    }
    var w = anchoDoc(doc);
    var h = altoDoc(doc);
    var rect = ((b[2] - b[0]) * (b[3] - b[1])) / (w * h);
    var cobertura = calcularCobertura(histogramaSeguro(doc), w * h, rect);
    if (cobertura * 100 > cfg.LIMITE_SELECCION) {
        res.revisar.push("la selecci\u00f3n ocupa el " + Math.round(cobertura * 100) +
            " % del lienzo (Seleccionar sujeto probablemente fall\u00f3)");
    }
    guardarSeleccionEnCanal(CANAL_SILUETA);
    try {
        doc.channels.getByName(CANAL_SILUETA).visible = false;
    } catch (e1) {
        // nada
    }
    seleccionarCompuestoRGB();
    doc.selection.deselect();
    r.ok = true;
    r.limites = redondearLimites(b, w, h);
    return r;
}

function eliminarCanal(doc, nombre) {
    try {
        doc.channels.getByName(nombre).remove();
    } catch (e) {
        // No existía.
    }
}

function agruparTodo(doc, nombre) {
    app.activeDocument = doc;
    seleccionarTodasLasCapas();
    agruparCapasSeleccionadas();
    var g = doc.activeLayer;
    if (g.typename !== "LayerSet") {
        throw new Error("No se pudo agrupar las capas.");
    }
    g.name = nombre;
    g.blendMode = BlendMode.NORMAL;
    return g;
}

function guardarComo(doc, archivo, formato, cfg) {
    var o;
    if (formato === "png") {
        o = new PNGSaveOptions();
        o.interlaced = false;
        try {
            doc.saveAs(archivo, o, true, Extension.LOWERCASE);
        } catch (e) {
            // Plan B: Guardar para Web (PNG-24 con transparencia).
            var w = new ExportOptionsSaveForWeb();
            w.format = SaveDocumentType.PNG;
            w.PNG8 = false;
            w.transparency = true;
            w.interlaced = false;
            doc.exportDocument(archivo, ExportType.SAVEFORWEB, w);
        }
    } else if (formato === "psd") {
        o = new PhotoshopSaveOptions();
        o.layers = true;
        o.embedColorProfile = true;
        o.alphaChannels = true;
        o.annotations = false;
        o.spotColors = false;
        doc.saveAs(archivo, o, true, Extension.LOWERCASE);
    } else if (formato === "jpg") {
        o = new JPEGSaveOptions();
        o.quality = cfg.CALIDAD_JPG;
        o.embedColorProfile = true;
        o.formatOptions = FormatOptions.STANDARDBASELINE;
        o.matte = MatteType.NONE;
        doc.saveAs(archivo, o, true, Extension.LOWERCASE);
    } else {
        throw new Error("Formato desconocido: " + formato);
    }
    if (!new File(archivo.fullName).exists) {
        throw new Error("Photoshop no cre\u00f3 el archivo " + archivo.fsName);
    }
}

// Guarda en los formatos dados con el mismo nombre libre (foto.png + foto.psd,
// o foto_2.png + foto_2.psd...). Devuelve los nombres usados.
function guardarSalidas(doc, nombreOriginal, carpeta, formatos, ctx, res) {
    var base = nombreLibre(nombreBase(nombreOriginal), formatos, existeEn(carpeta));
    var nombres = [];
    for (var i = 0; i < formatos.length; i++) {
        res.paso = "guardar " + formatos[i].toUpperCase();
        var archivo = new File(hijo(carpeta, base + "." + formatos[i]));
        guardarComo(doc, archivo, formatos[i], ctx.cfg);
        res.salidas.push(archivo);
        nombres.push(base + "." + formatos[i]);
    }
    return nombres.join(" + ");
}

function formatosConPsd(cfg) {
    return cfg.GUARDAR_PSD ? ["png", "psd"] : ["png"];
}


// ============================================================================
//  Tratamientos
// ============================================================================

// RECORTE: quita el fondo, duotono, semitono, papel, contorno y sombra.
function procesarRecorte(doc, nombre, ctx, res) {
    var cfg = ctx.cfg;

    res.paso = "convertir a RGB 8 bits";
    var foto = normalizarDocumento(doc, res);
    var h0 = altoDoc(doc);

    res.paso = "redimensionar";
    var hTrabajo = altoDeTrabajo(h0, cfg.ALTO_RECORTE, cfg.NORMALIZAR_SUJETO);
    var dt = dimsAlto(anchoDoc(doc), h0, hTrabajo);
    redimensionar(doc, dt.ancho, dt.alto);

    // Seleccionar sujeto ANTES de cambiar el color (detecta mejor con la foto original).
    res.paso = "seleccionar sujeto";
    var sel = detectarSujeto(doc, cfg, res);

    // Recortar a la silueta.
    res.paso = "recortar a la silueta";
    var altoSujeto = altoDoc(doc);
    if (sel.ok) {
        var L = sel.limites;
        doc.crop([new UnitValue(L[0], "px"), new UnitValue(L[1], "px"),
            new UnitValue(L[2], "px"), new UnitValue(L[3], "px")]);
        altoSujeto = altoDoc(doc);
    }

    // Tamaño final.
    res.paso = "tama\u00f1o final";
    var factor = dt.escala;
    if (cfg.NORMALIZAR_SUJETO) {
        var df = dimsAlto(anchoDoc(doc), altoDoc(doc), cfg.ALTO_RECORTE);
        redimensionar(doc, df.ancho, df.alto);
        // Ampliación respecto a los píxeles originales del sujeto.
        factor = cfg.ALTO_RECORTE / (altoSujeto / dt.escala);
    }
    avisarAmpliacion(factor, cfg, res, "imagen");

    // Color.
    res.paso = "duotono";
    var duo = crearDuotono(doc, foto, cfg);
    agregarSemitonoOpcional(doc, foto, duo, ctx, res);
    agregarPapelOpcional(doc, ctx, res, cfg.TEXTURA_PAPEL_OPACIDAD, "Papel");

    // Máscara de capa con la silueta.
    if (sel.ok) {
        res.paso = "m\u00e1scara de capa";
        doc.activeLayer = foto;
        cargarSeleccionDeCanal(CANAL_SILUETA);
        crearMascaraDesdeSeleccion();
        doc.selection.deselect();
    }
    eliminarCanal(doc, CANAL_SILUETA);

    // Grupo, lienzo y efectos.
    res.paso = "agrupar";
    var grupo = agruparTodo(doc, "Recorte");
    res.paso = "agregar lienzo";
    agregarLienzo(doc, margenRecorte(cfg));
    var conTrazo = cfg.CONTORNO_PX > 0;
    var conSombra = cfg.SOMBRA.opacidad > 0;
    if (conTrazo || conSombra) {
        res.paso = "contorno y sombra";
        doc.activeLayer = grupo;
        aplicarEstiloCapaActiva(cfg, conTrazo, conSombra);
    }

    return guardarSalidas(doc, nombre, ctx.carpetas.salida.recorte, formatosConPsd(cfg), ctx, res);
}

// IMPRESIÓN: foto o documento con duotono, semitono, papel, borde y sombra.
function procesarImpresion(doc, nombre, ctx, res) {
    var cfg = ctx.cfg;

    res.paso = "convertir a RGB 8 bits";
    var foto = normalizarDocumento(doc, res);

    res.paso = "redimensionar";
    var d = dimsLadoLargo(anchoDoc(doc), altoDoc(doc), cfg.LADO_LARGO_IMPRESION, true);
    redimensionar(doc, d.ancho, d.alto);
    avisarAmpliacion(d.escala, cfg, res, "imagen");

    res.paso = "duotono";
    var duo = crearDuotono(doc, foto, cfg);
    // El semitono va antes de agrandar el lienzo para no tramar zonas vacías.
    agregarSemitonoOpcional(doc, foto, duo, ctx, res);

    res.paso = "agregar lienzo";
    var b = cfg.BORDE_PAPEL_PX;
    var m = margenImpresion(cfg);
    agregarLienzo(doc, b + m);

    var borde = null;
    if (b > 0) {
        res.paso = "borde de papel";
        var w = anchoDoc(doc);
        var h = altoDoc(doc);
        doc.activeLayer = foto;
        borde = doc.artLayers.add();
        borde.name = "Borde de papel";
        // Debajo de la foto y fuera de la cadena de recorte de la foto.
        borde.move(foto, ElementPlacement.PLACEAFTER);
        if (borde.grouped) {
            borde.grouped = false;
        }
        doc.activeLayer = borde;
        doc.selection.select([[m, m], [w - m, m], [w - m, h - m], [m, h - m]]);
        doc.selection.fill(colorSolido(cfg.COLOR_PAPEL));
        doc.selection.deselect();
    }

    var papel = agregarPapelOpcional(doc, ctx, res, cfg.TEXTURA_PAPEL_OPACIDAD, "Papel");
    if (papel && borde && cfg.TEXTURA_BORDE_OPACIDAD > 0) {
        pasoOpcional(res, "Textura del borde", function () {
            var pb = papel.duplicate(borde, ElementPlacement.PLACEBEFORE);
            try {
                pb.name = "Papel del borde";
                pb.opacity = cfg.TEXTURA_BORDE_OPACIDAD;
                recortarEnCapaInferior(pb);
            } catch (e) {
                try { pb.remove(); } catch (e2) { /* nada */ }
                throw e;
            }
            return pb;
        });
    }

    res.paso = "agrupar";
    var grupo = agruparTodo(doc, "Impresion");
    if (cfg.SOMBRA.opacidad > 0) {
        res.paso = "sombra";
        doc.activeLayer = grupo;
        aplicarEstiloCapaActiva(cfg, false, true);
    }

    return guardarSalidas(doc, nombre, ctx.carpetas.salida.impresion, formatosConPsd(cfg), ctx, res);
}

// COMPLETA: imagen a pantalla completa con duotono, semitono y papel.
function procesarCompleta(doc, nombre, ctx, res) {
    var cfg = ctx.cfg;

    res.paso = "convertir a RGB 8 bits";
    var foto = normalizarDocumento(doc, res);

    res.paso = "redimensionar";
    var w0 = anchoDoc(doc);
    var h0 = altoDoc(doc);
    var d = dimsLadoLargo(w0, h0, cfg.LADO_LARGO_COMPLETA, false);
    redimensionar(doc, d.ancho, d.alto);
    avisarAmpliacion(cfg.LADO_LARGO_COMPLETA / Math.max(w0, h0), cfg, res,
        "imagen peque\u00f1a (" + Math.max(w0, h0) + " px); no se ampli\u00f3, pero al llenar la pantalla quedar\u00e1");

    res.paso = "duotono";
    var duo = crearDuotono(doc, foto, cfg);
    agregarSemitonoOpcional(doc, foto, duo, ctx, res);
    agregarPapelOpcional(doc, ctx, res, cfg.TEXTURA_PAPEL_OPACIDAD, "Papel");

    return guardarSalidas(doc, nombre, ctx.carpetas.salida.completa, ["jpg"], ctx, res);
}


// ============================================================================
//  Proceso de cada archivo
// ============================================================================

function procesarArchivo(trat, archivo, ctx) {
    var nombre = File.decode(archivo.name);
    var res = { revisar: [], avisos: [], salidas: [], paso: "abrir" };
    var cuenta = ctx.cuentas[trat.id];
    var doc = null;
    var salida = "";

    try {
        if (documentoYaAbierto(archivo)) {
            throw new Error("El archivo est\u00e1 abierto en Photoshop. Ci\u00e9rralo y vuelve a ejecutar el script.");
        }
        doc = app.open(archivo);
        app.activeDocument = doc;
        salida = trat.procesar(doc, nombre, ctx, res);
        res.paso = "cerrar";
        cerrarSinGuardar(doc);
        doc = null;
    } catch (e) {
        if (doc) {
            cerrarSinGuardar(doc);
        }
        borrarSalidas(res.salidas);
        cuenta.fallidas++;
        ctx.registrar("ERROR", trat.id, nombre, "fall\u00f3 en el paso \"" + res.paso + "\": " +
            textoError(e) + ". El original sigue en " + trat.entrada + ".");
        return;
    }

    var mov = moverOriginal(archivo, ctx.carpetas.procesadas[trat.id]);
    if (!mov.ok) {
        res.revisar.push(mov.mensaje);
    }

    for (var i = 0; i < res.avisos.length; i++) {
        ctx.registrar("AVISO", trat.id, nombre, res.avisos[i]);
    }
    var destino = "_listas/" + trat.salida + "/" + salida;
    cuenta.procesadas++;
    if (res.revisar.length > 0) {
        cuenta.revisar++;
        ctx.registrar("REVISAR", trat.id, nombre, destino + "  |  " + res.revisar.join("  |  "));
    } else {
        ctx.registrar("OK", trat.id, nombre, destino);
    }
}


// ============================================================================
//  Ventana de progreso (si falla, el script sigue sin ella)
// ============================================================================

function crearProgreso(total) {
    try {
        var w = new Window("palette", "QuincyFotos");
        w.alignChildren = "fill";
        w.texto = w.add("statictext", undefined, "Preparando...");
        w.texto.preferredSize = [440, 20];
        w.barra = w.add("progressbar", undefined, 0, total);
        w.barra.preferredSize = [440, 12];
        w.show();
        return w;
    } catch (e) {
        return null;
    }
}

function actualizarProgreso(w, valor, texto) {
    if (!w) {
        return;
    }
    try {
        w.texto.text = texto;
        w.barra.value = valor;
        w.update();
    } catch (e) {
        // nada
    }
}


// ============================================================================
//  Principal
// ============================================================================

function main() {
    var dialogosAntes = app.displayDialogs;
    var unidadesAntes = app.preferences.rulerUnits;
    var progreso = null;

    try {
        app.displayDialogs = DialogModes.NO;
        app.preferences.rulerUnits = Units.PIXELS;

        var v = validarConfig(CONFIG);
        if (v.errores.length > 0) {
            alert("Hay un problema en el bloque CONFIG del script:\n\n- " + v.errores.join("\n- ") +
                "\n\nCorr\u00edgelo y vuelve a ejecutar.", "QuincyFotos");
            return;
        }
        var cfg = v.cfg;

        var base = obtenerCarpetaBase(cfg);
        if (!base) {
            return;
        }
        var carpetas = crearEstructura(base);
        var tratamientos = listaTratamientos();

        var trabajos = [];
        var cuentas = {};
        for (var i = 0; i < tratamientos.length; i++) {
            cuentas[tratamientos[i].id] = nuevaCuenta();
            var lista = listarImagenes(carpetas.entrada[tratamientos[i].id]);
            for (var j = 0; j < lista.length; j++) {
                trabajos.push({ trat: tratamientos[i], archivo: lista[j] });
            }
        }

        if (trabajos.length === 0) {
            alert("No hay im\u00e1genes para procesar.\n\nPon tus im\u00e1genes en estas carpetas y vuelve a ejecutar:\n\n" +
                carpetas.entrada.recorte.fsName + "\n" + carpetas.entrada.impresion.fsName + "\n" +
                carpetas.entrada.completa.fsName + "\n\nY la textura en:\n" +
                carpetas.texturas.fsName + "\\" + NOMBRE_TEXTURA +
                "\n\n(Para elegir otra carpeta base, mant\u00e9n pulsada May\u00fas al ejecutar el script.)", "QuincyFotos");
            return;
        }

        var ctx = {
            cfg: cfg,
            carpetas: carpetas,
            cuentas: cuentas,
            textura: null,
            registrar: function (tipo, trat, archivo, detalle) {
                escribirLinea(carpetas.registro, lineaRegistro(fechaHora(new Date()), tipo, trat, archivo, detalle));
            }
        };

        escribirLinea(carpetas.registro, "");
        escribirLinea(carpetas.registro, "======================================================================");
        escribirLinea(carpetas.registro, "QuincyFotos " + VERSION + "  |  " + fechaHora(new Date()) +
            "  |  Photoshop " + app.version + "  |  " + trabajos.length + " im\u00e1genes");
        escribirLinea(carpetas.registro, "Carpeta base: " + base.fsName);
        escribirLinea(carpetas.registro, "CONFIG: " + resumenConfig(cfg));
        escribirLinea(carpetas.registro, "----------------------------------------------------------------------");

        var avisosGlobales = [];
        ctx.textura = prepararTextura(carpetas);
        if (!ctx.textura) {
            var aviso = "No se encontr\u00f3 " + NOMBRE_TEXTURA + " en " + carpetas.texturas.fsName +
                ": se proces\u00f3 todo SIN textura de papel.";
            avisosGlobales.push(aviso);
            ctx.registrar("AVISO", "-", NOMBRE_TEXTURA, aviso);
        }

        progreso = crearProgreso(trabajos.length);
        for (var k = 0; k < trabajos.length; k++) {
            var tj = trabajos[k];
            actualizarProgreso(progreso, k, (k + 1) + " de " + trabajos.length + "  (" +
                tj.trat.titulo + "): " + File.decode(tj.archivo.name));
            try {
                procesarArchivo(tj.trat, tj.archivo, ctx);
            } catch (eArchivo) {
                // Último recurso: nunca dejar que una imagen detenga a las demás.
                cuentas[tj.trat.id].fallidas++;
                ctx.registrar("ERROR", tj.trat.id, File.decode(tj.archivo.name), textoError(eArchivo));
            }
        }
        actualizarProgreso(progreso, trabajos.length, "Terminado.");

        var tp = 0, tr = 0, tf = 0;
        for (var n = 0; n < tratamientos.length; n++) {
            var c = cuentas[tratamientos[n].id];
            tp += c.procesadas;
            tr += c.revisar;
            tf += c.fallidas;
        }
        escribirLinea(carpetas.registro, "----------------------------------------------------------------------");
        escribirLinea(carpetas.registro, "Resumen: " + tp + " procesadas, " + tr + " para revisar, " + tf + " fallidas.");

        if (progreso) {
            try { progreso.close(); } catch (eCerrar) { /* nada */ }
            progreso = null;
        }
        alert(textoResumen(tratamientos, cuentas, avisosGlobales, carpetas.registro.fsName), "QuincyFotos");

    } catch (e) {
        alert("QuincyFotos se detuvo por un error inesperado:\n\n" + textoError(e), "QuincyFotos", true);
    } finally {
        if (progreso) {
            try { progreso.close(); } catch (e3) { /* nada */ }
        }
        app.displayDialogs = dialogosAntes;
        app.preferences.rulerUnits = unidadesAntes;
    }
}

// Solo se ejecuta dentro de Photoshop (en Node se cargan las funciones para probarlas).
if (typeof app !== "undefined" && typeof executeAction !== "undefined") {
    main();
}
