import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {aPantalla, Camara, CAMARA_GENERAL, EstadoCamara, Lienzo} from '../componentes/Camara';
import {Globo, GloboGrito} from '../componentes/Globo';
import {Escritorio, FondoOficina, OFICINA} from '../componentes/objetos/Oficina';
import {Pergamino} from '../componentes/objetos/Pergamino';
import {BOCA_EJECUTIVO, BRAZOS_EJECUTIVO_REPOSO, Ejecutivo, PropsEjecutivo} from '../componentes/personajes/Ejecutivo';
import {
	BOCA_ESPECIALISTA,
	BRAZOS_CON_CALCULADORA,
	CabezaEspecialista,
	EXPRESIONES_ESPECIALISTA,
	Especialista,
	expresionEspecialista,
	PropsEspecialista,
} from '../componentes/personajes/Especialista';
import {Rotulo} from '../componentes/Rotulo';
import {FPS, PALABRAS_POR_SEGUNDO, PLANOS} from '../timing';
import {entre, lineal, mezclar, mezclarPunto, parpadeo, Punto, respira, resorte, suave, temblor} from '../util/anim';

// ---------------------------------------------------------------------------
// Encuadres de la oficina.

export const CAM_ESPECIALISTA: EstadoCamara = {x: 430, y: 520, zoom: 1.9};
export const CAM_EJECUTIVO: EstadoCamara = {x: 1020, y: 380, zoom: 1.9};
export const CAM_PERGAMINO: EstadoCamara = {x: 1040, y: 380, zoom: 1.9};

const EJ = OFICINA.ejecutivo;
const ES = OFICINA.especialista;

/** Coordenadas locales del ejecutivo → mundo. */
export const mundoEjecutivo = (p: Punto): Punto => ({x: EJ.x + p.x * EJ.escala, y: EJ.y + p.y * EJ.escala});
/** Mundo → coordenadas locales del ejecutivo. */
export const localEjecutivo = (p: Punto): Punto => ({x: (p.x - EJ.x) / EJ.escala, y: (p.y - EJ.y) / EJ.escala});
export const mundoEspecialista = (p: Punto): Punto => ({x: ES.x + p.x * ES.escala, y: ES.y + p.y * ES.escala});

export const BOCA_EJE_MUNDO = mundoEjecutivo(BOCA_EJECUTIVO);
export const BOCA_ESP_MUNDO = mundoEspecialista(BOCA_ESPECIALISTA);

/** Apertura de boca mientras habla (aleteo simple, sin voz). */
export const habla = (f: number, desde: number, hasta: number) =>
	f >= desde && f < hasta ? Math.max(0, 0.18 + 0.32 * Math.sin((f - desde) * 1.25) + 0.12 * Math.sin((f - desde) * 0.53)) : 0;

/** Palabras visibles para un texto que aparece palabra por palabra. */
export const palabrasHasta = (f: number, desde: number, porSegundo = PALABRAS_POR_SEGUNDO) =>
	f < desde ? 0 : Math.floor(((f - desde) / FPS) * porSegundo) + 1;

// ---------------------------------------------------------------------------

type EscenaProps = {
	camara: EstadoCamara;
	temblor?: Punto;
	estela?: {dx: number; dy?: number; copias: number};
	semilla: string;
	ejecutivo?: Partial<PropsEjecutivo>;
	especialista?: Partial<PropsEspecialista>;
	/** En la pared (detrás de los personajes). */
	enPared?: React.ReactNode;
	/** Delante del escritorio y detrás de los brazos del ejecutivo. */
	delante?: React.ReactNode;
	/** Encima de todo, en coordenadas del mundo. */
	encima?: React.ReactNode;
	children?: React.ReactNode;
};

/**
 * Oficina simple: pared mostaza clara, ventana, escritorio con placa
 * «HOOVER», el ejecutivo detrás del escritorio y el especialista enfrente.
 * Los dos respiran y parpadean solos.
 */
export const EscenaOficina: React.FC<EscenaProps> = ({
	camara,
	temblor: t,
	estela,
	semilla,
	ejecutivo,
	especialista,
	enPared,
	delante,
	encima,
	children,
}) => {
	const f = useCurrentFrame();
	const eje: PropsEjecutivo = {
		x: EJ.x,
		y: EJ.y,
		escala: EJ.escala,
		mira: {x: -0.8, y: 0.3},
		respiracion: respira(f, 2, 0.01),
		parpadeo: parpadeo(f, `${semilla}-eje`),
		...ejecutivo,
	};
	const esp: PropsEspecialista = {
		x: ES.x,
		y: ES.y,
		escala: ES.escala,
		mira: {x: 0.8, y: -0.4},
		respiracion: respira(f, 2, 0.01, 0.7),
		parpadeo: parpadeo(f, `${semilla}-esp`),
		calculadora: {x: 0, y: -300, tapa: 0},
		...especialista,
	};
	return (
		<AbsoluteFill>
			<Camara {...camara} temblor={t} estela={estela}>
				<Lienzo>
					<FondoOficina />
					{enPared}
					<Ejecutivo {...eje} capa="cuerpo" />
					<Escritorio />
					{delante}
					<Ejecutivo {...eje} capa="brazos" />
					<Especialista {...esp} />
					{encima}
				</Lienzo>
			</Camara>
			{children}
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------------------

/** Plano 9: plano general de la oficina; el especialista se acomoda la visera y abre su calculadora. */
export const Plano09: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p09.claves;
	const sube = entre(f, K.visera, K.visera + 8, [0, 1]) - entre(f, K.visera + 12, K.visera + 20, [0, 1]);
	const brazoDer = {
		objetivo: mezclarPunto(BRAZOS_CON_CALCULADORA.der.objetivo, {x: 66, y: -566}, sube),
		pose: sube > 0.5 ? ('abierta' as const) : ('sujeta' as const),
		giroMano: mezclar(10, -100, sube),
	};
	return (
		<EscenaOficina
			camara={CAMARA_GENERAL}
			semilla="p09"
			especialista={{
				brazoDer,
				calculadora: {x: 0, y: -300, tapa: entre(f, K.calculadora, K.calculadora + 8, [0, 1]), pantalla: '0'},
			}}
		>
			<Rotulo texto="Conversación imaginada" desde={K.rotulo} />
		</EscenaOficina>
	);
};

const TEXTO_10 =
	'A ver… ¿me estás diciendo que si alguien gasta cien libras en una aspiradora, tú le regalas dos vuelos que valen seiscientas?';

/** Plano 10: plano medio del especialista, que se va alterando en tres etapas. */
export const Plano10: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p10.claves;
	const palabras = TEXTO_10.split(' ');
	const visibles = palabrasHasta(f, K.texto);
	const indiceSeiscientas = palabras.findIndex((p) => p.startsWith('seiscientas'));
	const frameSeiscientas = K.texto + Math.ceil((indiceSeiscientas / PALABRAS_POR_SEGUNDO) * FPS);

	// Tres etapas: calmado → cejas arriba y ojos más abiertos → ojos enormes, sudor y temblor.
	const e1 = entre(f, K.alterado, K.alterado + 8, [0, 1]);
	const e2 = entre(f, K.desesperado, K.desesperado + 8, [0, 1]);
	const base = e2 > 0 ? expresionEspecialista('alterado', 'desesperado', e2) : expresionEspecialista('calmado', 'alterado', e1);
	const terminoDeHablar = K.texto + Math.ceil((palabras.length / PALABRAS_POR_SEGUNDO) * FPS);
	const expresion = {...base, abierto: Math.min(1, base.abierto + habla(f, K.texto, terminoDeHablar) * (1 - e2 * 0.6))};
	const tiembla = f >= K.desesperado ? temblor(f, 'p10', 2) : {x: 0, y: 0};
	const faseSudor = f >= K.desesperado ? ((f - K.desesperado) % 40) / 40 : 0;

	const boca = aPantalla(BOCA_ESP_MUNDO, CAM_ESPECIALISTA);
	return (
		<EscenaOficina
			camara={CAM_ESPECIALISTA}
			semilla="p10"
			especialista={{
				expresion,
				mira: {x: mezclar(0.5, 0.15, e2), y: mezclar(-0.3, 0, e2)},
				temblor: tiembla,
				faseSudor,
				parpadeo: e2 > 0 ? 0 : parpadeo(f, 'p10-esp'),
				calculadora: {x: 0, y: -300, tapa: 1, pantalla: f >= frameSeiscientas ? '600' : f >= K.texto + 3.5 * FPS ? '100' : '0'},
			}}
		>
			<Globo
				x={1160}
				y={470}
				lado="abajo"
				ancla={0.06}
				anchoMax={720}
				texto={TEXTO_10}
				palabrasVisibles={visibles}
				enfasis={{palabra: 'seiscientas', frame: frameSeiscientas}}
				desde={K.texto}
				cola={{x: boca.x + 74, y: boca.y - 6}}
			/>
		</EscenaOficina>
	);
};

/** Cámara del plano 11: paneo rápido del especialista al ejecutivo. */
const camaraPaneo = (f: number): EstadoCamara => {
	const K = PLANOS.p11.claves;
	const t = entre(f, K.paneo, K.paneoFin, [0, 1], suave);
	return {
		x: mezclar(CAM_ESPECIALISTA.x, CAM_EJECUTIVO.x, t),
		y: mezclar(CAM_ESPECIALISTA.y, CAM_EJECUTIVO.y, t),
		zoom: CAM_EJECUTIVO.zoom,
	};
};

/** Plano 11: paneo al ejecutivo, que con los ojos entrecerrados hace un gesto tranquilo. */
export const Plano11: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p11.claves;
	const cam = camaraPaneo(f);
	const antes = camaraPaneo(f - 1);
	const estela = {dx: -(cam.x - antes.x) * cam.zoom * 1.4, dy: -(cam.y - antes.y) * cam.zoom * 1.4, copias: 4};

	const gesto = entre(f, K.brazo, K.brazoFin, [0, 1]);
	const giro = Math.sin(((f - K.brazo) / FPS) * Math.PI * 1.2) * 22 * gesto;
	const brazoDer = {
		objetivo: mezclarPunto(BRAZOS_EJECUTIVO_REPOSO.der.objetivo, {x: 34, y: -500}, gesto),
		pose: gesto > 0.3 ? ('abierta' as const) : ('puno' as const),
		giroMano: -40 * gesto + giro,
	};
	const boca = aPantalla(BOCA_EJE_MUNDO, CAM_EJECUTIVO);
	return (
		<EscenaOficina
			camara={cam}
			estela={estela}
			semilla="p11"
			ejecutivo={{brazoDer, habla: habla(f, K.globo, K.globo + 24) * 0.6, mira: {x: -0.5, y: 0.2}}}
			especialista={{expresion: EXPRESIONES_ESPECIALISTA.desesperado, calculadora: {x: 0, y: -300, tapa: 1, pantalla: '600'}}}
		>
			<Globo x={780} y={360} lado="abajo" ancla={0.55} texto="Mmm… yes." desde={K.globo} cola={{x: boca.x - 40, y: boca.y}} />
		</EscenaOficina>
	);
};

/** Plano 12: la cara desesperada del especialista entra de golpe e invade el plano del ejecutivo. */
export const Plano12: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p12.claves;
	const entra = resorte(f, K.cara, {damping: 9, stiffness: 1400, mass: 0.35});
	const x = mezclar(-520, 400, entra);
	const sacudida = f < K.temblorFin ? temblor(f, 'p12-cam', 16) : {x: 0, y: 0};
	const tiembla = temblor(f, 'p12-cara', 3);
	const bocaCara = {x: x + tiembla.x, y: 690 + (BOCA_ESPECIALISTA.y + 500) * 2.7};
	return (
		<EscenaOficina camara={CAM_EJECUTIVO} temblor={sacudida} semilla="p12" ejecutivo={{mira: {x: -0.9, y: 0.3}}}>
			<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
				<CabezaEspecialista
					x={x + tiembla.x}
					y={690 + tiembla.y}
					escala={2.7}
					expresion={EXPRESIONES_ESPECIALISTA.desesperado}
					mira={{x: 0.6, y: -0.1}}
					faseSudor={(f % 30) / 30}
				/>
			</svg>
			<GloboGrito
				x={690}
				y={215}
				ancho={900}
				alto={360}
				lineas={['¿¡TE VOLVISTE', 'LOCO!?']}
				tamano={70}
				desde={K.globo}
				cola={{x: bocaCara.x + 210, y: bocaCara.y - 250}}
			/>
		</EscenaOficina>
	);
};

/** Plano 13: el ejecutivo desenrolla el pergamino de reglas; el rollo cae y rueda fuera de cuadro. */
export const Plano13: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p13.claves;
	const arriba = 470;
	const ancho = 360;
	const piso = OFICINA.piso + 24;
	const finFinal = 2500;
	// Cae y cruza el escritorio con aceleración; en el piso rueda en línea recta.
	const posRollo = (fr: number) =>
		fr < K.rolloPiso
			? mezclar(arriba + 40, piso, entre(fr, K.desenrolla, K.rolloPiso, [0, 1], Easing.in(Easing.quad)))
			: lineal(fr, K.rolloPiso, K.rolloFin, [piso, finFinal]);
	const fin = posRollo(f);
	const largo = fin - arriba;
	const giro = (largo / 26) * (180 / Math.PI);
	// La cámara se engancha al rollo (entrada suave) y al final frena para que el rollo salga de cuadro.
	const engancha = entre(f, K.rolloPiso, K.rolloPiso + 14, [0, 1]);
	const frena = K.rolloFin - 24;
	const fCam = f <= frena ? f : frena + (f - frena) * 0.35;
	const camara = {...CAM_PERGAMINO, y: mezclar(CAM_PERGAMINO.y, Math.max(CAM_PERGAMINO.y, posRollo(fCam) - 150), engancha)};

	const manos = {
		izq: {objetivo: localEjecutivo({x: EJ.x - 128, y: arriba + 6}), pose: 'sujeta' as const, giroMano: -90},
		der: {objetivo: localEjecutivo({x: EJ.x + 128, y: arriba + 6}), pose: 'sujeta' as const, giroMano: 90},
	};
	const frase1 = 'Casi nadie va a terminar el trámite.';
	const texto = `${frase1} Lo hicimos difícil a propósito.`;
	const visibles = f >= K.segundaFrase ? texto.split(' ').length : frase1.split(' ').length;
	const boca = aPantalla(BOCA_EJE_MUNDO, camara);
	// Cuando la boca sale de cuadro, la cola apunta hacia arriba (habla fuera de cuadro) sin cruzar el papel.
	const fuera = Math.min(1, Math.max(0, (120 - boca.y) / 160));
	const colaGlobo = mezclarPunto({x: boca.x - 40, y: boca.y + 6}, {x: 560, y: -80}, fuera);
	return (
		<EscenaOficina
			camara={camara}
			semilla="p13"
			ejecutivo={{
				brazoIzq: manos.izq,
				brazoDer: manos.der,
				mira: {x: 0, y: 0.6},
				habla: (habla(f, K.globo, K.globo + 50) + habla(f, K.segundaFrase, K.segundaFrase + 40)) * 0.6,
			}}
			especialista={{calculadora: {x: 0, y: -300, tapa: 1, pantalla: '600'}}}
			delante={<Pergamino x={EJ.x} y={arriba} ancho={ancho} largo={largo} giro={giro} paso={330} />}
		>
			<Globo
				x={700}
				y={490}
				lado="arriba"
				ancla={0.92}
				anchoMax={620}
				texto={texto}
				palabrasVisibles={visibles}
				desde={K.globo}
				cola={colaGlobo}
			/>
		</EscenaOficina>
	);
};
