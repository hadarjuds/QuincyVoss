/**
 * TIEMPOS DEL GANCHO: el único archivo que hay que tocar cuando exista la voz.
 *
 * - `duracion`: largo de cada plano en segundos. El frame de inicio de cada
 *   plano se calcula sumando las duraciones anteriores, así que si alargas un
 *   plano, todos los siguientes se recorren solos.
 * - `claves`: momentos dentro del plano, en segundos desde el inicio de ese
 *   plano (el «+2.8 s» del storyboard).
 * - `subtitulos`: frases de la narración y el segundo (dentro del plano) en que
 *   aparece cada una. Cada frase se queda hasta que entra la siguiente o hasta
 *   que termina el plano.
 * - `sfx`: efectos de sonido marcados en el storyboard (solo anotados, sin audio).
 *
 * Todos los componentes leen sus momentos de aquí, ya convertidos a frames.
 */

export const FPS = 30;
export const ANCHO = 1920;
export const ALTO = 1080;

/** Velocidad del texto que aparece palabra por palabra en el globo del plano 10. */
export const PALABRAS_POR_SEGUNDO = 2.8;

type Frase = {t: number; texto: string; fin?: number};
type Sfx = {t: number; nombre: string};

type DefPlano = {
	titulo: string;
	duracion: number;
	claves: Record<string, number>;
	subtitulos?: Frase[];
	sfx?: Sfx[];
};

const DEFINICION = {
	p01: {
		titulo: 'Teléfono en la coladera',
		duracion: 3.0,
		claves: {manoEntra: 0, manoQuieta: 0.7, telefonoGira: 1.0, rebote: 1.8, seCuela: 2.2, desaparece: 2.6},
		subtitulos: [{t: 0, texto: 'Todos hemos cometido algún error caro.'}],
		sfx: [{t: 1.8, nombre: 'plink'}],
	},
	p02: {
		titulo: 'Gráfica vacía y barra de $72M',
		duracion: 5.0,
		claves: {eje: 0.1, ejeFin: 0.6, barra: 3.5, conteoFin: 4.2},
		subtitulos: [
			{t: 0, texto: 'Pues el error más barato de este video'},
			{t: 2.4, texto: 'costó unos 72 millones de dólares.'},
		],
	},
	p03: {
		titulo: 'Seis barras disparadas',
		duracion: 2.0,
		claves: {primeraBarra: 0, entreBarras: 0.27, iconoDura: 0.2, camaraFin: 2.0},
		sfx: [0, 0.27, 0.54, 0.81, 1.08, 1.35].map((t) => ({t, nombre: 'whoosh'})),
	},
	p04: {
		titulo: 'Entra la aspiradora',
		duracion: 3.0,
		claves: {camaraBaja: 0, camaraFin: 0.6, aspiradoraEntra: 0.5, aspiradoraFrena: 1.5, miraBarra: 1.8, miraCamara: 2.3},
		subtitulos: [{t: 0, texto: 'Y empezó con una aspiradora.'}],
		sfx: [{t: 1.5, nombre: 'rechinido al frenar'}],
	},
	p05: {
		titulo: 'Balanza: £100 contra dos vuelos',
		duracion: 12.0,
		claves: {rotulo: 0.3, balanza: 0.6, billete: 6.8, nota: 7.3, boleto1: 9.2, boleto2: 9.5},
		subtitulos: [
			{t: 0, texto: 'A finales de 1992, Hoover lanzó una promoción en el Reino Unido'},
			{t: 5.6, texto: 'en la que, si gastabas cien libras en sus productos,'},
			{t: 8.7, texto: 'te regalaba dos vuelos de ida y vuelta a Estados Unidos.'},
		],
	},
	p06: {
		titulo: 'La balanza se va de lado',
		duracion: 4.5,
		claves: {etiqueta: 0.3, inclina: 0.6, salto: 2.5, aterriza: 2.95},
		subtitulos: [
			{t: 0, texto: 'Esos boletos valían unas seiscientas libras,'},
			{t: 2.3, texto: 'y encima te quedabas la aspiradora.'},
		],
		sfx: [
			{t: 0.6, nombre: 'golpe metálico'},
			{t: 2.5, nombre: 'boing'},
		],
	},
	p07: {
		titulo: 'Anuncio de periódico',
		duracion: 3.5,
		claves: {entra: 0, entraFin: 0.8, linea1: 1.4, linea2: 2.6},
		subtitulos: [{t: 0, texto: 'El eslogan decía «Dos vuelos gratis. Increíble».'}],
	},
	p08: {
		titulo: 'La aspiradora lee el anuncio',
		duracion: 4.0,
		claves: {asoma: 0, asomaFin: 0.5, leeInicio: 0.7, leeFin: 2.0, voltea: 2.2, asiente: 2.5, asienteFin: 3.6},
		subtitulos: [{t: 0, texto: 'Por una vez un anuncio no estaba exagerando.'}],
	},
	p09: {
		titulo: 'Oficina: ejecutivo y especialista',
		duracion: 4.5,
		claves: {rotulo: 0.3, visera: 3.0, calculadora: 3.5},
		subtitulos: [{t: 0, texto: 'Antes de lanzar la oferta, Hoover consultó a un especialista en riesgos.'}],
	},
	p10: {
		titulo: 'El especialista se altera',
		duracion: 8.0,
		claves: {texto: 0.2, alterado: 2.0, desesperado: 5.0},
	},
	p11: {
		titulo: 'Ejecutivo: «Mmm… yes.»',
		duracion: 2.0,
		claves: {paneo: 0, paneoFin: 8 / FPS, globo: 0.3, brazo: 0.4, brazoFin: 1.2},
	},
	p12: {
		titulo: '¿¡Te volviste loco!?',
		duracion: 2.0,
		claves: {cara: 0, caraFin: 4 / FPS, temblorFin: 6 / FPS, globo: 0.1},
		sfx: [{t: 0, nombre: 'golpe'}],
	},
	p13: {
		titulo: 'El pergamino de reglas',
		duracion: 5.5,
		claves: {globo: 0.2, segundaFrase: 2.6, desenrolla: 0.4, rolloPiso: 2.5, rolloFin: 5.0},
	},
	p14: {
		titulo: 'No voy a cubrir esto',
		duracion: 2.0,
		claves: {globo: 0, tapa: 0.1, tapaFin: 0.1 + 6 / FPS, brazos: 0.8},
		sfx: [{t: 0.1, nombre: 'clac'}],
	},
	p15: {
		titulo: '¿Tan mala es la oferta?',
		duracion: 2.0,
		claves: {globo: 0, ceja: 0.3, interrogacion: 0.45},
	},
	p16: {
		titulo: '¿Dónde compro la aspiradora?',
		duracion: 3.5,
		claves: {globo: 0, cambio: 1.5, cartera: 1.6, brillo: 2.1},
	},
	p17: {
		titulo: 'El botón',
		duracion: 7.0,
		claves: {letrero: 0.2, voltean: 1.0, niega: 3.0, niegaFin: 4.6, mano: 5.0},
		subtitulos: [
			{t: 0, texto: 'El especialista en riesgos vio el riesgo'},
			{t: 3.0, texto: 'y no quiso correr el riesgo,'},
			{t: 5.0, texto: 'pero Hoover tuvo la gran idea'},
		],
	},
	p18: {
		titulo: 'Clic',
		duracion: 3.0,
		claves: {presiona: 0, clic: 0.2, parpadeo: 0.3, ojosBlanco: 0.7, negro: 3.0 - 10 / FPS},
		subtitulos: [{t: 0, texto: 'de correr el riesgo.', fin: 3.0 - 10 / FPS}],
		sfx: [{t: 0.2, nombre: 'clic del botón'}],
	},
} satisfies Record<string, DefPlano>;

// ---------------------------------------------------------------------------
// Todo lo de abajo se calcula a partir de DEFINICION.

export const seg = (s: number) => Math.round(s * FPS);

type Def = typeof DEFINICION;
export type IdPlano = keyof Def;

export type Plano<K extends IdPlano = IdPlano> = {
	id: K;
	numero: number;
	titulo: string;
	/** Frame (absoluto) en que empieza el plano. */
	inicio: number;
	/** Duración en frames. */
	duracion: number;
	/** Momentos clave en frames, relativos al inicio del plano. */
	claves: {[C in keyof Def[K]['claves']]: number};
	subtitulos: {desde: number; hasta: number; texto: string}[];
	sfx: {frame: number; nombre: string}[];
};

const calcular = () => {
	let inicio = 0;
	const out = {} as {[K in IdPlano]: Plano<K>};
	(Object.keys(DEFINICION) as IdPlano[]).forEach((id, i) => {
		const def: DefPlano = DEFINICION[id];
		const duracion = seg(def.duracion);
		const claves = Object.fromEntries(Object.entries(def.claves).map(([k, s]) => [k, seg(s)]));
		const frases = def.subtitulos ?? [];
		const subtitulos = frases.map((f, j) => ({
			desde: inicio + seg(f.t),
			hasta: f.fin !== undefined ? inicio + seg(f.fin) : j + 1 < frases.length ? inicio + seg(frases[j + 1].t) : inicio + duracion,
			texto: f.texto,
		}));
		const sfx = (def.sfx ?? []).map((s) => ({frame: inicio + seg(s.t), nombre: s.nombre}));
		(out as Record<string, unknown>)[id] = {id, numero: i + 1, titulo: def.titulo, inicio, duracion, claves, subtitulos, sfx};
		inicio += duracion;
	});
	return {planos: out, total: inicio};
};

const calculado = calcular();

/** Planos con tiempos en frames, por id (p01 … p18). */
export const PLANOS = calculado.planos;
/** Planos en orden. */
export const LISTA_PLANOS: Plano[] = Object.values(PLANOS);
/** Duración total de la composición en frames (2,295 con los tiempos del storyboard). */
export const DURACION_TOTAL = calculado.total;
/** Todas las frases de narración con frames absolutos. */
export const SUBTITULOS = LISTA_PLANOS.flatMap((p) => p.subtitulos);
/** Todos los efectos de sonido con frames absolutos (solo anotación). */
export const SFX = LISTA_PLANOS.flatMap((p) => p.sfx);
/** Frame central de cada plano (para los PNG de revisión). */
export const FRAMES_CENTRALES = LISTA_PLANOS.map((p) => ({
	numero: p.numero,
	titulo: p.titulo,
	frame: p.inicio + Math.floor(p.duracion / 2),
}));
