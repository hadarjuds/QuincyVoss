// Verificación de QuincyFotos.jsx fuera de Photoshop.
//
//   cd desarrollo
//   npm install
//   npm test
//
// 1. Analiza el archivo con acorn en modo ES3 (lo que entiende ExtendScript).
// 2. Busca funciones de JavaScript moderno que ExtendScript no tiene.
// 3. Comprueba que las cadenas no tengan caracteres fuera de ASCII (van como \uXXXX).
// 4. Carga el script en Node sin Photoshop y prueba las funciones puras.

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");
const acorn = require("acorn");

const ARCHIVO = path.join(__dirname, "..", "QuincyFotos.jsx");
const fuenteBruta = fs.readFileSync(ARCHIVO, "utf8");
const fuente = fuenteBruta.replace(/^\uFEFF/, "");

let fallos = 0;
let pruebas = 0;

function prueba(nombre, fn) {
  pruebas++;
  try {
    fn();
    console.log("  ok   " + nombre);
  } catch (e) {
    fallos++;
    console.log("  FALLO " + nombre + "\n        " + e.message);
  }
}

// ---------------------------------------------------------------------------
console.log("\n1. Sintaxis ES3");
let ast;
prueba("acorn ecmaVersion 3, sin palabras reservadas como propiedades", () => {
  ast = acorn.parse(fuente, { ecmaVersion: 3, allowReserved: "never", locations: true });
});
prueba("el archivo empieza con BOM UTF-8 (acentos de los comentarios)", () => {
  assert.strictEqual(fuenteBruta.charCodeAt(0), 0xfeff);
});

// ---------------------------------------------------------------------------
console.log("\n2. APIs que ExtendScript (ES3) no tiene");

function recorrer(nodo, visitar) {
  if (!nodo || typeof nodo.type !== "string") return;
  visitar(nodo);
  for (const k of Object.keys(nodo)) {
    const v = nodo[k];
    if (Array.isArray(v)) v.forEach((x) => recorrer(x, visitar));
    else if (v && typeof v.type === "string") recorrer(v, visitar);
  }
}

const PROHIBIDAS = new Set([
  "forEach", "map", "filter", "reduce", "reduceRight", "some", "every", "find", "findIndex",
  "includes", "trim", "trimStart", "trimEnd", "padStart", "padEnd", "startsWith", "endsWith",
  "repeat", "keys", "values", "entries", "isArray", "bind", "toISOString", "now", "assign",
  "defineProperty", "freeze", "getPrototypeOf"
]);

prueba("sin métodos ES5+ ni JSON", () => {
  const hallados = [];
  recorrer(ast, (n) => {
    if (n.type === "MemberExpression" && !n.computed && n.object.type === "Identifier" &&
        n.object.name === "Object" && n.property.name === "create") {
      hallados.push("Object.create (línea " + n.loc.start.line + ")");
    }
    if (n.type === "Identifier" && (n.name === "JSON" || n.name === "Symbol" || n.name === "Promise")) {
      hallados.push(n.name + " (línea " + n.loc.start.line + ")");
    }
    if (n.type === "MemberExpression" && !n.computed && PROHIBIDAS.has(n.property.name)) {
      const obj = n.object.type === "Identifier" ? n.object.name : "";
      hallados.push(obj + "." + n.property.name + " (línea " + n.loc.start.line + ")");
    }
  });
  assert.deepStrictEqual(hallados, []);
});

prueba("indexOf solo sobre cadenas (revisión manual de cada uso)", () => {
  const usos = [];
  recorrer(ast, (n) => {
    if (n.type === "MemberExpression" && !n.computed && n.property.name === "indexOf") {
      usos.push(fuente.slice(n.start, n.end));
    }
  });
  // El único uso es sobre la cadena CARPETA_BASE.
  assert.deepStrictEqual(usos, ["cfg.CARPETA_BASE.indexOf"]);
});

prueba("sin funciones declaradas dentro de bloques (no estándar en ES3)", () => {
  const malos = [];
  function revisar(nodo, padre) {
    if (!nodo || typeof nodo.type !== "string") return;
    if (nodo.type === "FunctionDeclaration") {
      const permitido = padre && (padre.type === "Program" || padre._cuerpoDeFuncion);
      if (!permitido) malos.push(nodo.id.name + " (línea " + nodo.loc.start.line + ")");
    }
    if ((nodo.type === "FunctionDeclaration" || nodo.type === "FunctionExpression") && nodo.body) {
      nodo.body._cuerpoDeFuncion = true;
    }
    for (const k of Object.keys(nodo)) {
      const v = nodo[k];
      for (const h of Array.isArray(v) ? v : [v]) {
        if (h && typeof h.type === "string") revisar(h, nodo);
      }
    }
  }
  revisar(ast, null);
  assert.deepStrictEqual(malos, []);
});

prueba("cada función llamada está definida o es un global de Photoshop/ExtendScript", () => {
  const GLOBALES = new Set([
    // JavaScript ES3
    "String", "Number", "Math", "Object", "Array", "Date", "Error", "RegExp", "parseInt", "parseFloat",
    "isNaN", "isFinite",
    // ExtendScript / ScriptUI
    "File", "Folder", "UnitValue", "Window", "alert", "confirm",
    // Photoshop
    "charIDToTypeID", "stringIDToTypeID", "executeAction", "ActionDescriptor", "ActionReference",
    "ActionList", "SolidColor", "PNGSaveOptions", "PhotoshopSaveOptions", "JPEGSaveOptions",
    "ExportOptionsSaveForWeb"
  ]);
  const definidas = new Set();
  recorrer(ast, (n) => {
    if (n.type === "FunctionDeclaration") definidas.add(n.id.name);
    if (n.type === "VariableDeclarator") definidas.add(n.id.name);
    if (n.type === "FunctionDeclaration" || n.type === "FunctionExpression") {
      n.params.forEach((p) => definidas.add(p.name));
    }
  });
  const faltan = [];
  recorrer(ast, (n) => {
    if ((n.type === "CallExpression" || n.type === "NewExpression") && n.callee.type === "Identifier") {
      const nombre = n.callee.name;
      if (!definidas.has(nombre) && !GLOBALES.has(nombre)) {
        faltan.push(nombre + " (línea " + n.loc.start.line + ")");
      }
    }
  });
  assert.deepStrictEqual(faltan, []);
});

prueba("los enumerados de Photoshop usados existen en la API (lista conocida)", () => {
  const CONOCIDOS = {
    DialogModes: ["NO"], Units: ["PIXELS"], DocumentMode: ["RGB", "BITMAP"],
    ChangeMode: ["RGB", "GRAYSCALE"], BitsPerChannelType: ["EIGHT"],
    Intent: ["RELATIVECOLORIMETRIC"], ResampleMethod: ["BICUBICAUTOMATIC", "BICUBIC"],
    AnchorPosition: ["MIDDLECENTER"], SaveOptions: ["DONOTSAVECHANGES"],
    ElementPlacement: ["PLACEBEFORE", "PLACEAFTER", "PLACEATBEGINNING"],
    BlendMode: ["MULTIPLY", "NORMAL"], Extension: ["LOWERCASE"],
    SaveDocumentType: ["PNG"], ExportType: ["SAVEFORWEB"],
    FormatOptions: ["STANDARDBASELINE"], MatteType: ["NONE"]
  };
  const desconocidos = [];
  recorrer(ast, (n) => {
    if (n.type === "MemberExpression" && !n.computed && n.object.type === "Identifier" &&
        /^[A-Z]/.test(n.object.name) && CONOCIDOS.hasOwnProperty(n.object.name)) {
      if (CONOCIDOS[n.object.name].indexOf(n.property.name) < 0) {
        desconocidos.push(n.object.name + "." + n.property.name);
      }
    }
  });
  assert.deepStrictEqual(desconocidos, []);
});

prueba("los códigos de 4 letras de charIDToTypeID miden exactamente 4 caracteres", () => {
  const malos = [];
  recorrer(ast, (n) => {
    if (n.type === "CallExpression" && n.callee.type === "Identifier" &&
        (n.callee.name === "cTID" || n.callee.name === "charIDToTypeID") &&
        n.arguments[0] && n.arguments[0].type === "Literal" && n.arguments[0].value.length !== 4) {
      malos.push(JSON.stringify(n.arguments[0].value) + " (línea " + n.loc.start.line + ")");
    }
  });
  assert.deepStrictEqual(malos, []);
});

// ---------------------------------------------------------------------------
console.log("\n3. Codificación de las cadenas");
prueba("todas las cadenas son ASCII (acentos como \\uXXXX)", () => {
  const malas = [];
  for (const t of acorn.tokenizer(fuente, { ecmaVersion: 3, locations: true })) {
    if (t.type === acorn.tokTypes.string && /[^\x00-\x7f]/.test(fuente.slice(t.start, t.end))) {
      malas.push("línea " + t.loc.start.line);
    }
  }
  assert.deepStrictEqual(malas, []);
});

// ---------------------------------------------------------------------------
console.log("\n4. Funciones sin Photoshop");

const ctx = vm.createContext({});
vm.runInContext(fuente, ctx, { filename: "QuincyFotos.jsx" });
const Q = ctx;
const copia = (x) => JSON.parse(JSON.stringify(x));

prueba("main() no se ejecuta fuera de Photoshop", () => {
  assert.strictEqual(typeof Q.main, "function");
  assert.strictEqual(typeof Q.app, "undefined");
});

prueba("CONFIG por defecto es válido", () => {
  const v = Q.validarConfig(Q.CONFIG);
  assert.deepStrictEqual(copia(v.errores), []);
  assert.strictEqual(v.cfg.ALTO_RECORTE, 1600);
  assert.strictEqual(v.cfg.LADO_LARGO_IMPRESION, 1600);
  assert.strictEqual(v.cfg.LADO_LARGO_COMPLETA, 3840);
  assert.strictEqual(v.cfg.COLOR_TINTA, "1C1915");
  assert.deepStrictEqual(copia(v.cfg.DUOTONO), ["1C1915", "8A6B4E", "F3E9D2"]);
  assert.strictEqual(v.cfg.CONTORNO_PX, 10);
  assert.deepStrictEqual(copia(v.cfg.SOMBRA), { distancia: 8, angulo: 135, opacidad: 30, suavidad: 0 });
  assert.strictEqual(v.cfg.BORDE_PAPEL_PX, 40);
  assert.strictEqual(v.cfg.COLOR_PAPEL, "FBF7EE");
  assert.strictEqual(v.cfg.TEXTURA_PAPEL_OPACIDAD, 35);
  assert.strictEqual(v.cfg.SEMITONO_ACTIVO, true);
  assert.strictEqual(v.cfg.SEMITONO_RADIO, 6);
  assert.strictEqual(v.cfg.SEMITONO_OPACIDAD, 15);
  assert.strictEqual(v.cfg.GUARDAR_PSD, true);
  assert.strictEqual(v.cfg.CARPETA_BASE, "");
});

function configCon(cambios) {
  const c = copia(Q.CONFIG);
  Object.assign(c, cambios);
  return vm.runInContext("(" + JSON.stringify(c) + ")", ctx);
}

prueba("CONFIG: acepta colores con # y minúsculas", () => {
  const v = Q.validarConfig(configCon({ COLOR_TINTA: "#1c1915 ", DUOTONO: ["#000000", "ffffff"] }));
  assert.deepStrictEqual(copia(v.errores), []);
  assert.strictEqual(v.cfg.COLOR_TINTA, "1C1915");
  assert.deepStrictEqual(copia(v.cfg.DUOTONO), ["000000", "FFFFFF"]);
});

prueba("CONFIG: detecta errores comunes", () => {
  const casos = [
    [{ COLOR_TINTA: "1C191" }, "COLOR_TINTA"],
    [{ COLOR_TINTA: "negro" }, "COLOR_TINTA"],
    [{ CONTORNO_PX: "10" }, "CONTORNO_PX"],
    [{ CONTORNO_PX: 10.5 }, "CONTORNO_PX"],
    [{ CONTORNO_PX: 300 }, "CONTORNO_PX"],
    [{ SEMITONO_RADIO: 2 }, "SEMITONO_RADIO"],
    [{ SEMITONO_ACTIVO: "true" }, "SEMITONO_ACTIVO"],
    [{ DUOTONO: ["1C1915"] }, "DUOTONO"],
    [{ DUOTONO: "1C1915" }, "DUOTONO"],
    [{ DUOTONO: ["1C1915", "zzz"] }, "DUOTONO (color 2)"],
    [{ SOMBRA: 8 }, "SOMBRA"],
    [{ SOMBRA: { distancia: 8, angulo: 135, opacidad: 130, suavidad: 0 } }, "SOMBRA.opacidad"],
    [{ CARPETA_BASE: "C:\\Users\\Ana" }, "CARPETA_BASE"],
    [{ CALIDAD_JPG: 13 }, "CALIDAD_JPG"],
    [{ ALTO_RECORTE: undefined }, "ALTO_RECORTE"]
  ];
  for (const [cambio, clave] of casos) {
    const v = Q.validarConfig(configCon(cambio));
    assert.ok(v.errores.length >= 1, "no detectó " + JSON.stringify(cambio));
    assert.ok(v.errores[0].indexOf(clave) === 0, "mensaje inesperado: " + v.errores[0]);
  }
});

prueba("CONFIG: ángulo 315 se normaliza a -45", () => {
  const v = Q.validarConfig(configCon({ SOMBRA: { distancia: 8, angulo: 315, opacidad: 30, suavidad: 0 } }));
  assert.deepStrictEqual(copia(v.errores), []);
  assert.strictEqual(v.cfg.SOMBRA.angulo, -45);
});

prueba("CONFIG: CARPETA_BASE con barras normales es válida", () => {
  const v = Q.validarConfig(configCon({ CARPETA_BASE: " C:/Users/Ana/Desktop/_Imagenes " }));
  assert.deepStrictEqual(copia(v.errores), []);
  assert.strictEqual(v.cfg.CARPETA_BASE, "C:/Users/Ana/Desktop/_Imagenes");
});

prueba("hexARgb", () => {
  assert.deepStrictEqual(copia(Q.hexARgb("1C1915")), [28, 25, 21]);
  assert.deepStrictEqual(copia(Q.hexARgb("FBF7EE")), [251, 247, 238]);
  assert.deepStrictEqual(copia(Q.hexARgb("8A6B4E")), [138, 107, 78]);
});

prueba("formatos de entrada aceptados", () => {
  const si = ["a.jpg", "a.JPG", "a.jpeg", "a.png", "a.webp", "a.tif", "a.TIFF", "a.psd", "mi foto.final.Png", "café.jpg"];
  const no = ["a.gif", "a.txt", "a", ".jpg", "._a.jpg", "~$a.psd", "a.jpg.bak", "a.psb", ""];
  si.forEach((n) => assert.strictEqual(Q.esImagenValida(n), true, n));
  no.forEach((n) => assert.strictEqual(Q.esImagenValida(n), false, n));
});

prueba("nombreBase y extensionDe", () => {
  assert.strictEqual(Q.nombreBase("foto.jpg"), "foto");
  assert.strictEqual(Q.nombreBase("mi.foto.final.PNG"), "mi.foto.final");
  assert.strictEqual(Q.nombreBase("sinextension"), "sinextension");
  assert.strictEqual(Q.extensionDe("mi.foto.final.PNG"), "PNG");
  assert.strictEqual(Q.extensionDe("sinextension"), "");
});

prueba("nombreLibre: no sobrescribe y usa _2, _3...", () => {
  const existentes = new Set(["foto.png", "foto_2.psd", "otra.jpg"]);
  const existe = (n) => existentes.has(n);
  assert.strictEqual(Q.nombreLibre("nueva", ["png", "psd"], existe), "nueva");
  // foto.png existe -> foto_2; foto_2.psd existe -> foto_3 (PNG y PSD comparten número).
  assert.strictEqual(Q.nombreLibre("foto", ["png", "psd"], existe), "foto_3");
  assert.strictEqual(Q.nombreLibre("foto", ["jpg"], existe), "foto");
  assert.strictEqual(Q.nombreLibre("otra", ["jpg"], existe), "otra_2");
});

prueba("dimsAlto mantiene la proporción", () => {
  assert.deepStrictEqual(copia(Q.dimsAlto(3000, 4000, 1600)), { ancho: 1200, alto: 1600, escala: 0.4 });
  const d = Q.dimsAlto(800, 400, 1600);
  assert.strictEqual(d.ancho, 3200);
  assert.strictEqual(d.escala, 4);
});

prueba("dimsLadoLargo: impresión (amplía y reduce)", () => {
  assert.deepStrictEqual(copia(Q.dimsLadoLargo(4000, 3000, 1600, true)), { ancho: 1600, alto: 1200, escala: 0.4 });
  assert.deepStrictEqual(copia(Q.dimsLadoLargo(3000, 4000, 1600, true)), { ancho: 1200, alto: 1600, escala: 0.4 });
  assert.deepStrictEqual(copia(Q.dimsLadoLargo(800, 600, 1600, true)), { ancho: 1600, alto: 1200, escala: 2 });
});

prueba("dimsLadoLargo: completa (nunca amplía)", () => {
  assert.deepStrictEqual(copia(Q.dimsLadoLargo(1920, 1080, 3840, false)), { ancho: 1920, alto: 1080, escala: 1 });
  assert.deepStrictEqual(copia(Q.dimsLadoLargo(3840, 2160, 3840, false)), { ancho: 3840, alto: 2160, escala: 1 });
  assert.deepStrictEqual(copia(Q.dimsLadoLargo(7680, 4320, 3840, false)), { ancho: 3840, alto: 2160, escala: 0.5 });
  assert.deepStrictEqual(copia(Q.dimsLadoLargo(4000, 6000, 3840, false)), { ancho: 2560, alto: 3840, escala: 0.64 });
});

prueba("altoDeTrabajo", () => {
  assert.strictEqual(Q.altoDeTrabajo(4000, 1600, false), 1600);
  assert.strictEqual(Q.altoDeTrabajo(800, 1600, false), 1600);
  assert.strictEqual(Q.altoDeTrabajo(800, 1600, true), 1600);
  assert.strictEqual(Q.altoDeTrabajo(2400, 1600, true), 2400);
  assert.strictEqual(Q.altoDeTrabajo(6000, 1600, true), 3200);
});

prueba("calcularCobertura", () => {
  const h = new Array(256).fill(0);
  h[128] = 500;
  h[255] = 300;
  // 800 de 1000 píxeles, rectángulo 0.9 -> 0.8
  assert.strictEqual(Q.calcularCobertura(vm.runInContext(JSON.stringify(h), ctx), 1000, 0.9), 0.8);
  // Histograma que ignora la selección (todo el lienzo) -> usa el rectángulo
  const todo = new Array(256).fill(0);
  todo[0] = 1000;
  assert.strictEqual(Q.calcularCobertura(todo, 1000, 0.5), 0.5);
  // Sin histograma -> rectángulo
  assert.strictEqual(Q.calcularCobertura(null, 1000, 0.42), 0.42);
  assert.strictEqual(Q.calcularCobertura([1, 2], 1000, 0.42), 0.42);
  // Selección casi total -> > 97 %
  const casi = new Array(256).fill(0);
  casi[200] = 985;
  assert.ok(Q.calcularCobertura(casi, 1000, 1) * 100 > 97);
});

prueba("redondearLimites redondea hacia afuera y ajusta al lienzo", () => {
  assert.deepStrictEqual(copia(Q.redondearLimites([10.4, 20.6, 100.2, 200.9], 1000, 1000)), [10, 20, 101, 201]);
  assert.deepStrictEqual(copia(Q.redondearLimites([-3, -1, 1200, 1700], 1000, 1600)), [0, 0, 1000, 1600]);
  assert.deepStrictEqual(copia(Q.redondearLimites([5, 5, 5, 5], 10, 10)), [5, 5, 6, 6]);
});

prueba("posicionesMosaico cubre todo el lienzo", () => {
  assert.deepStrictEqual(copia(Q.posicionesMosaico(1600, 1600, 2048, 2048)), [[0, 0]]);
  assert.deepStrictEqual(copia(Q.posicionesMosaico(3840, 2160, 2048, 2048)), [[0, 0], [2048, 0], [0, 2048], [2048, 2048]]);
  assert.strictEqual(Q.posicionesMosaico(2048, 2048, 2048, 2048).length, 1);
  assert.strictEqual(Q.posicionesMosaico(2049, 2048, 2048, 2048).length, 2);
});

prueba("posicionesDegradado", () => {
  assert.deepStrictEqual(copia(Q.posicionesDegradado(3)), [0, 2048, 4096]);
  assert.deepStrictEqual(copia(Q.posicionesDegradado(2)), [0, 4096]);
  assert.deepStrictEqual(copia(Q.posicionesDegradado(5)), [0, 1024, 2048, 3072, 4096]);
});

prueba("márgenes de lienzo", () => {
  const cfg = Q.validarConfig(Q.CONFIG).cfg;
  assert.strictEqual(Q.margenRecorte(cfg), 10 + 8 + 0 + 20);
  assert.strictEqual(Q.margenImpresion(cfg), 8 + 0 + 20);
});

prueba("decidirCarpetaBase", () => {
  assert.strictEqual(Q.decidirCarpetaBase("_Imagenes", false, false), "usar");
  assert.strictEqual(Q.decidirCarpetaBase("_imagenes", false, false), "usar");
  assert.strictEqual(Q.decidirCarpetaBase("Proyecto", true, false), "usar");
  assert.strictEqual(Q.decidirCarpetaBase("Escritorio", false, true), "sub");
  assert.strictEqual(Q.decidirCarpetaBase("Escritorio", false, false), "preguntar");
});

prueba("rutasEstructura", () => {
  assert.deepStrictEqual(copia(Q.rutasEstructura()), [
    "1_recorte", "2_impresion", "3_completa",
    "_listas", "_listas/recorte", "_listas/impresion", "_listas/completa",
    "_procesadas", "_procesadas/1_recorte", "_procesadas/2_impresion", "_procesadas/3_completa",
    "_texturas"
  ]);
});

prueba("fechaHora y lineaRegistro", () => {
  const d = vm.runInContext("new Date(2026, 0, 5, 9, 7, 3)", ctx);
  assert.strictEqual(Q.fechaHora(d), "2026-01-05 09:07:03");
  assert.strictEqual(Q.lineaRegistro("F", "OK", "recorte", "a.jpg", "_listas/recorte/a.png"),
    "F  OK      recorte   a.jpg  ->  _listas/recorte/a.png");
  assert.strictEqual(Q.lineaRegistro("F", "REVISAR", "impresion", "b.jpg", ""),
    "F  REVISAR impresion b.jpg");
});

prueba("textoError incluye la línea", () => {
  assert.strictEqual(Q.textoError({ message: "Fallo", line: 42 }), "Fallo (línea 42)");
  assert.strictEqual(Q.textoError({ message: "Fallo" }), "Fallo");
  assert.strictEqual(Q.textoError("texto"), "texto");
});

prueba("recortarEspacios quita espacios y BOM", () => {
  assert.strictEqual(Q.recortarEspacios("\uFEFF  /c/Users/x \r\n"), "/c/Users/x");
});

prueba("resumenConfig", () => {
  const cfg = Q.validarConfig(Q.CONFIG).cfg;
  const s = Q.resumenConfig(cfg);
  assert.ok(s.indexOf("ALTO_RECORTE=1600") >= 0, s);
  assert.ok(s.indexOf("DUOTONO=[1C1915,8A6B4E,F3E9D2]") >= 0, s);
  assert.ok(s.indexOf("SOMBRA={distancia:8,angulo:135,opacidad:30,suavidad:0}") >= 0, s);
});

prueba("textoResumen cuenta por tratamiento", () => {
  const t = Q.listaTratamientos();
  const cuentas = vm.runInContext(
    "({recorte:{procesadas:2,revisar:1,fallidas:0},impresion:{procesadas:1,revisar:0,fallidas:1},completa:{procesadas:0,revisar:0,fallidas:0}})", ctx);
  const s = Q.textoResumen(t, cuentas, ["sin textura"], "C:\\registro.txt");
  assert.ok(s.indexOf("Recorte: 2 procesadas (1 para revisar), 0 fallidas") >= 0, s);
  assert.ok(s.indexOf("Impresión: 1 procesadas (0 para revisar), 1 fallidas") >= 0, s);
  assert.ok(s.indexOf("Total: 3 procesadas, 1 para revisar, 1 fallidas.") >= 0, s);
  assert.ok(s.indexOf("AVISO: sin textura") >= 0, s);
  assert.ok(s.indexOf("C:\\registro.txt") >= 0, s);
});

// ---------------------------------------------------------------------------
console.log("\n" + (pruebas - fallos) + " de " + pruebas + " pruebas correctas.");
process.exit(fallos ? 1 : 0);
