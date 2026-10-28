import React from 'react';
import {C, D, FUENTE} from '../../estilo';
import {mezclarObj, Punto} from '../../util/anim';
import {trazo, useLinea} from '../Linea';
import {Boca, Brazo, Ceja, Estrella, Gota, Ojo, PoseMano} from './partes';

/** Parámetros de expresión. Todos son números para poder mezclar etapas sin saltos. */
export type ExpresionEspecialista = {
	cejaY: number;
	/** Positivo = cejas preocupadas (punta interior arriba); negativo = enojadas. */
	cejaAng: number;
	/** Tamaño de los ojos (1 = normal). */
	ojo: number;
	parpado: number;
	/** Pupilas arriba (negativo) o abajo. Con -2.4 se esconden: ojos en blanco. */
	pupilaY: number;
	ancho: number;
	abierto: number;
	sonrisa: number;
	dientes: number;
	sudor: number;
	brillo: number;
};

export const EXPRESIONES_ESPECIALISTA = {
	calmado: {cejaY: 0, cejaAng: 0, ojo: 1, parpado: 0.12, pupilaY: 0, ancho: 34, abierto: 0, sonrisa: 0.35, dientes: 0, sudor: 0, brillo: 0},
	alterado: {
		cejaY: 14,
		cejaAng: 10,
		ojo: 1.22,
		parpado: 0,
		pupilaY: 0,
		ancho: 26,
		abierto: 0.45,
		sonrisa: -0.15,
		dientes: 0,
		sudor: 0,
		brillo: 0,
	},
	desesperado: {
		cejaY: 22,
		cejaAng: 24,
		ojo: 1.6,
		parpado: 0,
		pupilaY: 0,
		ancho: 56,
		abierto: 1,
		sonrisa: -0.55,
		dientes: 1,
		sudor: 1,
		brillo: 0,
	},
	serio: {
		cejaY: -4,
		cejaAng: -8,
		ojo: 1,
		parpado: 0.32,
		pupilaY: 0,
		ancho: 32,
		abierto: 0,
		sonrisa: -0.12,
		dientes: 0,
		sudor: 0,
		brillo: 0,
	},
	sonriente: {
		cejaY: 10,
		cejaAng: 5,
		ojo: 1.18,
		parpado: 0,
		pupilaY: 0,
		ancho: 56,
		abierto: 0.65,
		sonrisa: 0.95,
		dientes: 1,
		sudor: 0,
		brillo: 1,
	},
	indignado: {
		cejaY: -6,
		cejaAng: -22,
		ojo: 1.08,
		parpado: 0.18,
		pupilaY: 0,
		ancho: 32,
		abierto: 0.25,
		sonrisa: -0.75,
		dientes: 0,
		sudor: 0,
		brillo: 0,
	},
	ojosEnBlanco: {
		cejaY: 6,
		cejaAng: 6,
		ojo: 1,
		parpado: 0.5,
		pupilaY: -2.4,
		ancho: 30,
		abierto: 0,
		sonrisa: -0.35,
		dientes: 0,
		sudor: 0,
		brillo: 0,
	},
} satisfies Record<string, ExpresionEspecialista>;

export type NombreExpresionEspecialista = keyof typeof EXPRESIONES_ESPECIALISTA;

/** Mezcla dos expresiones con nombre. */
export const expresionEspecialista = (a: NombreExpresionEspecialista, b?: NombreExpresionEspecialista, t = 0) =>
	b ? mezclarObj(EXPRESIONES_ESPECIALISTA[a], EXPRESIONES_ESPECIALISTA[b], t) : EXPRESIONES_ESPECIALISTA[a];

export type BrazoEspecialista = {objetivo: Punto; pose?: PoseMano; giroMano?: number; sostiene?: React.ReactNode};

export const HOMBRO_ESPECIALISTA = {izq: {x: -92, y: -396}, der: {x: 92, y: -396}};
export const CENTRO_CABEZA = {x: 0, y: -500};
export const BOCA_ESPECIALISTA = {x: 0, y: -446};
export const CALCULADORA_EN_MANOS = {x: 0, y: -300};

/** Manos sujetando la calculadora por los lados. */
export const BRAZOS_CON_CALCULADORA = {
	izq: {objetivo: {x: -84, y: -300}, pose: 'sujeta', giroMano: -10},
	der: {objetivo: {x: 84, y: -300}, pose: 'sujeta', giroMano: 10},
} satisfies Record<string, BrazoEspecialista>;

/** Brazos cruzados sobre el pecho. */
export const BRAZOS_CRUZADOS = {
	izq: {objetivo: {x: 62, y: -318}, pose: 'puno', giroMano: 0},
	der: {objetivo: {x: -62, y: -338}, pose: 'puno', giroMano: 0},
} satisfies Record<string, BrazoEspecialista>;

export const BRAZOS_SUELTOS = {
	izq: {objetivo: {x: -112, y: -236}, pose: 'abierta', giroMano: 0},
	der: {objetivo: {x: 112, y: -236}, pose: 'abierta', giroMano: 0},
} satisfies Record<string, BrazoEspecialista>;

// ---------------------------------------------------------------------------

type CabezaProps = {
	e: ExpresionEspecialista;
	mira: Punto;
	parpadeo: number;
	/** Giro de la cabeza en grados (alrededor del cuello). */
	giro: number;
	/** Fase de la gota de sudor (0 a 1, baja por la sien). */
	faseSudor: number;
	/** Giro de las estrellas del brillo, en grados. */
	giroBrillo: number;
	lw: {gruesa: number; fina: number};
};

const Cabeza: React.FC<CabezaProps> = ({e, mira, parpadeo, giro, faseSudor, giroBrillo, lw}) => {
	const {gruesa, fina} = lw;
	const rOjoX = 15 * e.ojo;
	const rOjoY = 17 * e.ojo;
	const rLente = Math.max(28, rOjoY + 7);
	return (
		<g transform={`rotate(${giro} 0 -430)`}>
			{/* Orejas */}
			<circle cx={-80} cy={-492} r={17} fill={D.piel} {...trazo(gruesa)} />
			<circle cx={80} cy={-492} r={17} fill={D.piel} {...trazo(gruesa)} />
			<circle cx={0} cy={-500} r={82} fill={D.piel} {...trazo(gruesa)} />
			{/* Pelo a los lados */}
			<path
				d="M -78 -530 Q -96 -508 -80 -480 Q -70 -500 -66 -528 Z M 78 -530 Q 96 -508 80 -480 Q 70 -500 66 -528 Z"
				fill={C.tinta}
				{...trazo(fina)}
			/>
			{/* Cachetes */}
			<ellipse cx={-52} cy={-458} rx={14} ry={9} fill={C.rojo} opacity={0.22 + e.sudor * 0.15} />
			<ellipse cx={52} cy={-458} rx={14} ry={9} fill={C.rojo} opacity={0.22 + e.sudor * 0.15} />
			{/* Ojos detrás de lentes redondos */}
			{[-34, 34].map((cx) => (
				<g key={cx}>
					<Ojo
						cx={cx}
						cy={-494}
						rx={rOjoX}
						ry={rOjoY}
						mira={{x: mira.x, y: mira.y + e.pupilaY}}
						pupila={0.5 / Math.sqrt(e.ojo)}
						parpado={Math.max(e.parpado, parpadeo)}
						colorParpado={D.piel}
						lw={fina}
						estrella={e.brillo}
					/>
					<circle cx={cx} cy={-494} r={rLente} fill={C.blanco} fillOpacity={0.12} stroke={C.tinta} strokeWidth={fina * 1.3} />
				</g>
			))}
			<path d={`M ${-34 + rLente} -500 Q 0 -512 ${34 - rLente} -500`} fill="none" {...trazo(fina * 1.3)} />
			{/* Cejas */}
			<Ceja cx={-34} cy={-532 - e.cejaY} largo={30} angulo={-e.cejaAng} grosor={fina * 2.4} />
			<Ceja cx={34} cy={-532 - e.cejaY} largo={30} angulo={e.cejaAng} grosor={fina * 2.4} />
			{/* Nariz */}
			<circle cx={0} cy={-470} r={11} fill={D.pielSombra} {...trazo(fina)} />
			<Boca
				cx={BOCA_ESPECIALISTA.x}
				cy={BOCA_ESPECIALISTA.y}
				ancho={e.ancho}
				abierto={e.abierto}
				sonrisa={e.sonrisa}
				altoMax={22}
				lw={fina * 1.2}
				dientes={e.dientes > 0.5}
			/>
			{/* Visera verde azulado semitransparente */}
			<path d="M -82 -548 Q 0 -600 82 -548" fill="none" stroke={C.verdeAzulado} strokeWidth={14} strokeLinecap="round" />
			<path
				d="M -104 -548 Q 0 -588 104 -548 L 92 -520 Q 0 -548 -92 -520 Z"
				fill={C.verdeAzulado}
				fillOpacity={0.55}
				{...trazo(gruesa * 0.8)}
			/>
			{/* Sudor */}
			{e.sudor > 0.02 ? (
				<Gota x={86} y={-560 + faseSudor * 60} tam={16} lw={fina} opacidad={Math.min(1, e.sudor * 1.5) * (1 - faseSudor * 0.6)} />
			) : null}
			{/* Destellos alrededor de los ojos */}
			{e.brillo > 0.02 ? (
				<>
					<Estrella cx={-82} cy={-548} r={18 * e.brillo} color={C.mostaza} lw={fina} giro={giroBrillo} />
					<Estrella cx={86} cy={-540} r={14 * e.brillo} color={C.mostaza} lw={fina} giro={-giroBrillo} />
				</>
			) : null}
		</g>
	);
};

// ---------------------------------------------------------------------------

export type PropsCalculadora = {
	x: number;
	y: number;
	/** 0 = tapa cerrada, 1 = abierta (la tapa gira sobre la bisagra con scaleY). */
	tapa: number;
	pantalla?: string;
	escala?: number;
	lw: {gruesa: number; fina: number};
};

/** Calculadora grande con tapa. */
export const Calculadora: React.FC<PropsCalculadora> = ({x, y, tapa, pantalla = '0', escala = 1, lw}) => {
	const {gruesa, fina} = lw;
	const w = 150;
	const h = 190;
	const teclas = [];
	for (let f = 0; f < 4; f++) {
		for (let c = 0; c < 4; c++) {
			teclas.push(
				<rect
					key={`${f}-${c}`}
					x={-w / 2 + 16 + c * 31}
					y={-h / 2 + 76 + f * 25}
					width={24}
					height={18}
					rx={5}
					fill={f === 3 && c === 3 ? C.rojo : C.papel}
					{...trazo(fina * 0.7)}
				/>,
			);
		}
	}
	// Cerrada: cubre el frente (escala 1). Abierta: inclinada hacia atrás, en escorzo sobre la bisagra (-0.32).
	const sy = 1 - 1.32 * tapa;
	return (
		<g transform={`translate(${x} ${y}) scale(${escala})`}>
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={C.grisCalido} {...trazo(gruesa)} />
			<rect x={-w / 2 + 14} y={-h / 2 + 16} width={w - 28} height={46} rx={6} fill={D.pantallaCalc} {...trazo(fina)} />
			<text x={w / 2 - 22} y={-h / 2 + 52} textAnchor="end" fontFamily={FUENTE.cifras} fontSize={30} fill={C.tinta}>
				{pantalla}
			</text>
			{teclas}
			{/* Tapa con bisagra arriba */}
			<g transform={`translate(0 ${-h / 2}) scale(1 ${sy})`}>
				<rect x={-w / 2 - 4} y={0} width={w + 8} height={h + 4} rx={14} fill={D.pantalon} {...trazo(gruesa)} />
				<rect x={-w / 2 + 14} y={16} width={w - 20} height={h - 30} rx={8} fill="none" stroke={C.grisCalido} strokeWidth={fina} />
			</g>
		</g>
	);
};

// ---------------------------------------------------------------------------

export type PropsEspecialista = {
	x: number;
	y: number;
	escala?: number;
	expresion?: ExpresionEspecialista;
	mira?: Punto;
	parpadeo?: number;
	/** Giro de la cabeza (negar, indignarse). */
	cabeza?: number;
	/** Temblor en px (se suma a la posición). */
	temblor?: Punto;
	respiracion?: number;
	/** Hombros caídos en px (positivo = abajo). */
	hombros?: number;
	faseSudor?: number;
	giroBrillo?: number;
	brazoIzq?: BrazoEspecialista;
	brazoDer?: BrazoEspecialista;
	/** Calculadora (coordenadas locales). Sin esta prop no aparece. */
	calculadora?: {x: number; y: number; tapa: number; pantalla?: string};
	/** Dibuja el brazo derecho detrás del izquierdo (para los brazos cruzados). */
	derechoAtras?: boolean;
};

/**
 * Especialista en riesgos: bajo y redondo, camisa blanca arremangada, visera
 * verde azulado, lentes redondos y calculadora grande. Origen: entre los pies.
 */
export const Especialista: React.FC<PropsEspecialista> = ({
	x,
	y,
	escala = 1,
	expresion = EXPRESIONES_ESPECIALISTA.calmado,
	mira = {x: 0, y: 0},
	parpadeo = 0,
	cabeza = 0,
	temblor = {x: 0, y: 0},
	respiracion = 1,
	hombros = 0,
	faseSudor = 0,
	giroBrillo = 0,
	brazoIzq = BRAZOS_CON_CALCULADORA.izq,
	brazoDer = BRAZOS_CON_CALCULADORA.der,
	calculadora,
	derechoAtras,
}) => {
	const lw = useLinea(escala);
	const {gruesa, fina} = lw;
	const brazo = (b: BrazoEspecialista, lado: 'izq' | 'der') => (
		<Brazo
			hombro={{x: HOMBRO_ESPECIALISTA[lado].x, y: HOMBRO_ESPECIALISTA[lado].y + hombros}}
			objetivo={b.objetivo}
			l1={80}
			l2={84}
			doblez={lado === 'izq' ? 1 : -1}
			grosor={34}
			colorSup={C.blanco}
			colorInf={D.piel}
			remango
			pose={b.pose ?? 'abierta'}
			tamMano={32}
			giroMano={b.giroMano}
			espejo={lado === 'der'}
			lw={gruesa}
			sostiene={b.sostiene}
		/>
	);
	return (
		<g transform={`translate(${x + temblor.x} ${y + temblor.y}) scale(${escala})`}>
			{/* Piernas y zapatos */}
			<rect x={-48} y={-190} width={36} height={180} fill={D.pantalon} {...trazo(gruesa)} />
			<rect x={12} y={-190} width={36} height={180} fill={D.pantalon} {...trazo(gruesa)} />
			<ellipse cx={-34} cy={-10} rx={34} ry={14} fill={C.tinta} />
			<ellipse cx={34} cy={-10} rx={34} ry={14} fill={C.tinta} />
			<g transform={`translate(0 -170) scale(1 ${respiracion}) translate(0 170)`}>
				{/* Cuerpo redondo con camisa blanca */}
				<ellipse cx={0} cy={-300} rx={118} ry={142} fill={C.blanco} {...trazo(gruesa)} />
				<path d="M -112 -232 Q 0 -196 112 -232" fill="none" stroke={D.maderaOscura} strokeWidth={14} />
				<path d="M -114 -238 Q 0 -202 114 -238" fill="none" {...trazo(fina)} />
				<line x1={0} y1={-432} x2={0} y2={-220} stroke={C.grisCalido} strokeWidth={fina} />
				{[-400, -350, -300, -250].map((cy) => (
					<circle key={cy} cx={8} cy={cy} r={4} fill={C.grisCalido} />
				))}
				{/* Bolsillo con pluma */}
				<rect x={-82} y={-392} width={26} height={60} rx={4} fill={C.verdeAzulado} {...trazo(fina)} />
				<path d="M -96 -372 L -44 -372 L -48 -330 L -92 -330 Z" fill={C.blanco} {...trazo(fina)} />
				{/* Cuello de la camisa */}
				<path d="M -34 -438 L -4 -412 L -10 -440 Z M 34 -438 L 4 -412 L 10 -440 Z" fill={C.blanco} {...trazo(fina)} />
				<g transform={`translate(0 ${hombros * 0.6})`}>
					<Cabeza e={expresion} mira={mira} parpadeo={parpadeo} giro={cabeza} faseSudor={faseSudor} giroBrillo={giroBrillo} lw={lw} />
				</g>
				{calculadora ? <Calculadora {...calculadora} lw={lw} /> : null}
				{derechoAtras ? brazo(brazoDer, 'der') : null}
				{brazo(brazoIzq, 'izq')}
				{derechoAtras ? null : brazo(brazoDer, 'der')}
			</g>
		</g>
	);
};

/** Solo la cabeza del especialista (para el primer plano del plano 12). */
export const CabezaEspecialista: React.FC<{
	x: number;
	y: number;
	escala: number;
	expresion: ExpresionEspecialista;
	mira?: Punto;
	giro?: number;
	faseSudor?: number;
}> = ({x, y, escala, expresion, mira = {x: 0, y: 0}, giro = 0, faseSudor = 0}) => {
	const lw = useLinea(escala);
	return (
		<g transform={`translate(${x} ${y}) scale(${escala}) translate(${-CENTRO_CABEZA.x} ${-CENTRO_CABEZA.y})`}>
			{/* Cuello de camisa para que la cabeza no flote */}
			<path d="M -70 -430 Q 0 -400 70 -430 L 110 -300 L -110 -300 Z" fill={C.blanco} {...trazo(lw.gruesa)} />
			<Cabeza e={expresion} mira={mira} parpadeo={0} giro={giro} faseSudor={faseSudor} giroBrillo={0} lw={lw} />
		</g>
	);
};
