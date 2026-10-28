import React from 'react';
import {C, D} from '../../estilo';
import {mezclarObj, Punto} from '../../util/anim';
import {trazo, useLinea} from '../Linea';
import {Boca, FormaBoca, Ojo} from './partes';

export type ExpresionAspiradora = 'neutral' | 'seria' | 'sorprendida';

const EXPRESIONES: Record<ExpresionAspiradora, FormaBoca & {parpado: number}> = {
	neutral: {ancho: 34, abierto: 0, sonrisa: 0.45, parpado: 0},
	seria: {ancho: 30, abierto: 0, sonrisa: 0, parpado: 0.28},
	sorprendida: {ancho: 22, abierto: 0.8, sonrisa: 0, parpado: 0},
};

export type PropsAspiradora = {
	/** Punto de apoyo en el piso (centro entre las ruedas). */
	x: number;
	y: number;
	escala?: number;
	/** Inclinación de todo el cuerpo sobre la base (balanceo al frenar), en grados. */
	inclinacion?: number;
	/** 0 a 1: la parte de arriba se inclina hacia adelante para asentir. */
	asiente?: number;
	/** Giro de las ruedas en grados. */
	giroRuedas?: number;
	/** Aplastamiento (1 = normal, <1 = aplastada). */
	aplasta?: number;
	mira?: Punto;
	/** 0 = ojos abiertos, 1 = cerrados (parpadeo). */
	parpadeo?: number;
	expresion?: ExpresionAspiradora;
	/** Para mezclar con otra expresión (0 a 1). */
	hacia?: {expresion: ExpresionAspiradora; t: number};
};

/**
 * Aspiradora vertical de los 90: cuerpo rojo, bolsa gris claro con la cara,
 * mango con agarre negro y base con dos ruedas. Origen: piso, entre las ruedas.
 */
export const Aspiradora: React.FC<PropsAspiradora> = ({
	x,
	y,
	escala = 1,
	inclinacion = 0,
	asiente = 0,
	giroRuedas = 0,
	aplasta = 1,
	mira = {x: 0, y: 0},
	parpadeo = 0,
	expresion = 'neutral',
	hacia,
}) => {
	const {gruesa, fina} = useLinea(escala);
	const e = hacia ? mezclarObj(EXPRESIONES[expresion], EXPRESIONES[hacia.expresion], hacia.t) : EXPRESIONES[expresion];
	const cuello = -96;
	const rueda = (cx: number) => (
		<g transform={`translate(${cx} -26)`}>
			<circle r={26} fill={C.tinta} />
			<g transform={`rotate(${giroRuedas})`}>
				{[0, 60, 120].map((a) => (
					<line
						key={a}
						x1={-17}
						y1={0}
						x2={17}
						y2={0}
						transform={`rotate(${a})`}
						stroke={C.grisCalido}
						strokeWidth={fina * 1.4}
						strokeLinecap="round"
					/>
				))}
			</g>
			<circle r={8} fill={C.grisCalido} {...trazo(fina)} />
		</g>
	);
	return (
		<g transform={`translate(${x} ${y}) scale(${escala * (2 - aplasta) ** 0.5} ${escala * aplasta}) rotate(${inclinacion})`}>
			{/* Sombra en el piso */}
			<ellipse cx={0} cy={2} rx={120} ry={10} fill={C.tinta} opacity={0.12} />
			{/* Parte de arriba: cuerpo, bolsa, cara y mango (gira en el cuello para asentir). */}
			<g transform={`translate(0 ${cuello}) rotate(${asiente * 4}) scale(1 ${1 - asiente * 0.1}) translate(0 ${-cuello})`}>
				{/* Mango */}
				<rect x={-11} y={-505} width={22} height={120} fill={C.grisCalido} {...trazo(gruesa)} />
				<rect x={-50} y={-534} width={100} height={36} rx={18} fill={C.tinta} {...trazo(gruesa)} />
				{/* Columna roja */}
				<rect x={-36} y={-405} width={72} height={316} rx={34} fill={C.rojo} {...trazo(gruesa)} />
				{/* Bolsa */}
				<rect x={-82} y={-368} width={164} height={236} rx={64} fill={D.bolsa} {...trazo(gruesa)} />
				<path d="M -40 -362 Q 0 -350 40 -362" fill="none" {...trazo(fina)} />
				{/* Correas de la bolsa */}
				<rect x={-30} y={-382} width={60} height={22} rx={8} fill={C.rojo} {...trazo(fina)} />
				<rect x={-30} y={-142} width={60} height={22} rx={8} fill={C.rojo} {...trazo(fina)} />
				{/* Cachetes */}
				<ellipse cx={-50} cy={-226} rx={13} ry={8} fill={C.rojo} opacity={0.25} />
				<ellipse cx={50} cy={-226} rx={13} ry={8} fill={C.rojo} opacity={0.25} />
				{/* Ojos */}
				{[-30, 30].map((cx) => (
					<Ojo
						key={cx}
						cx={cx}
						cy={-282}
						rx={23}
						ry={32}
						mira={mira}
						pupila={0.5}
						parpado={Math.max(e.parpado, parpadeo)}
						colorParpado={D.bolsa}
						lw={gruesa * 0.75}
					/>
				))}
				<Boca cx={0} cy={-212} ancho={e.ancho} abierto={e.abierto} sonrisa={e.sonrisa} altoMax={14} lw={gruesa * 0.75} />
			</g>
			{/* Base */}
			<circle cx={0} cy={cuello} r={18} fill={C.grisCalido} {...trazo(gruesa)} />
			<rect x={-112} y={-90} width={224} height={54} rx={24} fill={C.rojo} {...trazo(gruesa)} />
			<line x1={-88} y1={-58} x2={88} y2={-58} stroke={D.rojoOscuro} strokeWidth={fina * 2} strokeLinecap="round" />
			<ellipse cx={-80} cy={-72} rx={12} ry={7} fill={C.mostaza} {...trazo(fina)} />
			{rueda(-64)}
			{rueda(64)}
		</g>
	);
};
